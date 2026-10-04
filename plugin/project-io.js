import { mkdir, open, realpath, rename, unlink } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { randomUUID } from "node:crypto";

export async function projectFile(projectPath, value) {
  const root = await realpath(resolve(projectPath));
  const candidate = resolve(root, value);
  const suffix = [];
  let probe = candidate;
  while (true) {
    try { probe = resolve(await realpath(probe), ...suffix.reverse()); break; }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      suffix.push(basename(probe));
      const parent = dirname(probe);
      if (parent === probe) throw error;
      probe = parent;
    }
  }
  for (const path of [candidate, probe]) {
    const rel = relative(root, path);
    if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("Path must resolve inside projectPath.");
  }
  return candidate;
}

export async function readBoundedFile(path, maxBytes, signal) {
  signal?.throwIfAborted();
  const file = await open(path, "r");
  try {
    const details = await file.stat();
    if (!details.isFile() || details.size > maxBytes) throw new Error(`File exceeds the ${maxBytes} byte safety limit or is not a regular file.`);
    // Detect growth after stat without an unbounded readFile.
    const bytes = Buffer.alloc(Math.min(details.size + 1, maxBytes + 1));
    let count = 0;
    while (count < bytes.length) {
      signal?.throwIfAborted();
      const { bytesRead } = await file.read(bytes, count, bytes.length - count, null);
      if (!bytesRead) break;
      count += bytesRead;
    }
    if (count > details.size || count > maxBytes) throw new Error("File changed during bounded read; retry capture.");
    return bytes.subarray(0, count);
  } finally { await file.close(); }
}

export function parseJson(source) { return JSON.parse(String(source).replace(/^\uFEFF/, "")); }

export async function atomicProjectWrite(projectPath, value, content) {
  const path = await projectFile(projectPath, value);
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${randomUUID()}`;
  try {
    const file = await open(await projectFile(projectPath, temporary), "wx", 0o600);
    try { await file.writeFile(content, "utf8"); } finally { await file.close(); }
    await projectFile(projectPath, value);
    await rename(temporary, path);
  } finally { await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; }); }
}

export async function withProjectLock(projectPath, action, signal) {
  const directory = await projectFile(projectPath, ".showcase");
  await mkdir(directory, { recursive: true });
  const path = await projectFile(projectPath, ".showcase/.write.lock");
  const deadline = Date.now() + 30_000;
  let lock;
  while (!lock) {
    signal?.throwIfAborted();
    try { lock = await open(path, "wx", 0o600); }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (Date.now() >= deadline) throw new Error("Project output is locked by another capture/generation. If its process crashed, verify it has stopped before removing .showcase/.write.lock.");
      await delay(30, undefined, { signal });
    }
  }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    signal?.throwIfAborted();
    return await action();
  } finally { await lock.close(); await unlink(path); }
}
