export function projectFile(projectPath: string, value: string): Promise<string>;
export function readBoundedFile(path: string, maxBytes: number, signal?: AbortSignal): Promise<Buffer>;
export function parseJson(source: string | Buffer): unknown;
export function atomicProjectWrite(projectPath: string, value: string, content: string): Promise<void>;
export function withProjectLock<T>(projectPath: string, action: () => Promise<T>, signal?: AbortSignal): Promise<T>;
