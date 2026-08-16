import { type KeyboardEvent, useEffect, useState } from "react";
import {
  Check, ChevronDown, Code2, Download, FileCode2, FileJson2, Image, LockKeyhole,
  TerminalSquare, Timer, Upload, X,
} from "lucide-react";
import { demoReport } from "./core/browser";

type Theme = "field" | "fish";

const stages = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];
const diffs: Record<string, string[]> = {
  "src/App.tsx": ["@@ -1,8 +1,42 @@", "-export default function App() {", "-  return <main>Ready</main>;", "+export default function App() {", "+  return <ReportWorkspace report={demoReport} />;", "+}", "+", "+function ReportWorkspace() {", "+  return <main className=\"report-shell\">...</main>;", "+}"],
  "src/styles.css": ["@@ -0,0 +1,96 @@", "+:root {", "+  --signal: #f6c344;", "+  --surface: #15191a;", "+}", "+.operations-rail {", "+  display: grid;", "+  grid-template-columns: repeat(5, 1fr);", "+}"],
};

function formatDuration(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function ScreenMock({ kind }: { kind: "desktop" | "tablet" | "mobile" }) {
  return <div className={`screen-mock ${kind}`} aria-hidden="true"><i /><b /><b /><b /><span /><span /><span /><span /></div>;
}

function escapeCoverHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === '"') return "&quot;";
    return "&#39;";
  });
}

function blobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The local cover asset could not be read."));
    reader.readAsDataURL(blob);
  });
}

function createCoverHtml(dataUrl: string, task: string, files: number, tests: string, redactions: number, viewports: string) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>dsh-showcase cover</title><style>*{box-sizing:border-box}body{margin:0;background:#061b2c;color:#f2fcff;font-family:Arial,sans-serif}.cover{width:1600px;height:900px;position:relative;overflow:hidden;padding:78px 92px;background:linear-gradient(90deg,#061b2c 0%,rgba(6,27,44,.96) 48%,rgba(6,27,44,.42) 63%,transparent 78%),url('${dataUrl}') right center/auto 100% no-repeat}.content{width:52%;position:relative;z-index:1}.eyebrow{color:#67dcef;font:700 16px monospace;letter-spacing:2px}.title{font-size:62px;line-height:1;margin:16px 0}.task{font-size:24px;line-height:1.35;color:#d5e8ee}.verified{display:inline-block;margin:24px 0;padding:9px 13px;background:#79e0a9;color:#062718;font:700 18px monospace}.rail{display:flex;border:1px solid #477080}.rail span{flex:1;min-height:64px;padding:10px;border-right:1px solid #477080;font-weight:700}.rail span:last-child{border:0}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.metric{border-left:3px solid #ffd45d;padding:10px;background:rgba(6,27,44,.72)}.metric b{display:block;font-size:27px}.metric small{color:#b9d1d8;font-family:monospace}.viewports{margin-top:16px;color:#b9d1d8;font:14px monospace}.footer{position:absolute;bottom:54px;left:92px;color:#67dcef;font:700 15px monospace;letter-spacing:1px}</style></head><body><main class="cover"><div class="content"><div class="eyebrow">DELIVERY EVIDENCE</div><h1 class="title">dsh-showcase</h1><p class="task">${escapeCoverHtml(task)}</p><div class="verified">VERIFIED</div><div class="rail"><span>PROMPT</span><span>BUILD</span><span>TEST</span><span>CAPTURE</span><span>SHIP</span></div><div class="metrics"><div class="metric"><b>${files}</b><small>FILES CHANGED</small></div><div class="metric"><b>${tests}</b><small>TESTS PASSED</small></div><div class="metric"><b>${redactions}</b><small>REDACTIONS</small></div></div><div class="viewports">${escapeCoverHtml(viewports)}</div></div><div class="footer">LOCAL ONLY / NO UPLOAD</div></main></body></html>`;
}


export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("dsh-theme") as Theme) || "field");
  const [selectedFile, setSelectedFile] = useState("src/App.tsx");
  const [comparison, setComparison] = useState(58);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
    const [coverDataUrl, setCoverDataUrl] = useState("");
    const [coverAssetError, setCoverAssetError] = useState("");

  const report = demoReport;

  useEffect(() => { localStorage.setItem("dsh-theme", theme); }, [theme]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);
    useEffect(() => {
      let disposed = false;
      fetch("/whale-girl-poster.webp")
        .then((response) => {
          if (!response.ok) throw new Error(`cover asset returned ${response.status}`);
          return response.blob();
        })
        .then(blobAsDataUrl)
        .then((dataUrl) => { if (!disposed) setCoverDataUrl(dataUrl); })
        .catch((error: unknown) => { if (!disposed) setCoverAssetError(error instanceof Error ? error.message : "The local cover asset could not be loaded."); });
      return () => { disposed = true; };
    }, []);

  const exportReport = (label: string) => { setLoading(true); window.setTimeout(() => { setLoading(false); setToast(`${label} prepared locally`); }, 420); };
    const exportCover = () => {
      setLoading(true);
      try {
        if (coverAssetError) { setToast(`Cover export failed locally: ${coverAssetError}`); return; }
          if (!coverDataUrl) { setToast("Cover asset is still preparing locally."); return; }
          const response = { ok: true, status: 0 };

        if (!response.ok) throw new Error(`cover asset returned ${response.status}`);
        const dataUrl = coverDataUrl;
        const passed = report.tests.filter((test) => test.status === "passed").length;
        const viewports = report.screenshots.map((shot) => `${shot.viewport.name} ${shot.viewport.width}x${shot.viewport.height}`).join(" / ");
        const documentHtml = createCoverHtml(dataUrl, report.task.goal, report.git.summary.changedFiles, `${passed}/${report.tests.length}`, report.redaction.totalReplacements, viewports);
        const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "dsh-showcase-cover.html";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setToast("Self-contained cover downloaded locally");
      } catch (error) {
        setToast(`Cover export failed locally: ${error instanceof Error ? error.message : "unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

  const setComparisonValue = (value: number) => setComparison(Math.max(0, Math.min(100, value)));
  const handleComparisonKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 100 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? comparison - 1 : event.key === "ArrowRight" || event.key === "ArrowUp" ? comparison + 1 : null;
    if (next !== null) { event.preventDefault(); setComparisonValue(next); }
  };

  return <main className={`app theme-${theme}`}><div className="workspace">
    <header className="report-header"><div className="identity"><span className="mark">DS</span><div><p className="eyebrow">delivery evidence / 0017</p><h1>dsh-showcase</h1></div></div><div className="header-meta"><span><Code2 size={15} /> {report.git.baseRef}..{report.git.headRef}</span><span><Timer size={15} /> {new Date(report.generatedAt).toLocaleString()}</span><span className="verified"><Check size={15} /> verified</span></div><div className="theme-switch" role="group" aria-label="Report theme"><button className={theme === "field" ? "active" : ""} onClick={() => setTheme("field")} aria-pressed={theme === "field"}>Field Signal</button><button className={theme === "fish" ? "active" : ""} onClick={() => setTheme("fish")} aria-pressed={theme === "fish"}>Blue Big Fish</button></div></header>
      <section className="poster-summary" aria-labelledby="poster-title"><div className="poster-content"><p className="poster-kicker">delivery evidence / local report</p><h2 id="poster-title">dsh-showcase</h2><p className="poster-goal">{report.task.goal}</p><span className="poster-verified"><Check size={16} /> VERIFIED</span><div className="poster-rail">{stages.map((stage) => <span key={stage}>{stage}</span>)}</div><div className="poster-metrics"><div><strong>{report.git.summary.changedFiles}</strong><span>Files changed</span></div><div><strong>{report.tests.filter((test) => test.status === "passed").length}/{report.tests.length}</strong><span>Tests passed</span></div><div><strong>{report.redaction.totalReplacements}</strong><span>Redactions</span></div></div><p className="poster-viewports">{report.screenshots.map((shot) => `${shot.viewport.name} ${shot.viewport.width}x${shot.viewport.height}`).join(" / ")}</p></div><p className="poster-footer">LOCAL ONLY / NO UPLOAD</p></section>

    <section className="operations-rail" aria-label="Delivery stages">{stages.map((stage, index) => <div className={`stage ${index < 4 ? "complete" : "ready"}`} key={stage}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong><i /></div>)}</section>
    <section className="evidence-band overview-band" aria-labelledby="overview-title"><div className="band-heading"><span>01</span><h2 id="overview-title">Delivery brief</h2><p>Completed with reproducible evidence</p></div><div className="overview-grid"><div className="goal"><span className="label">Task goal</span><p>{report.task.goal}</p></div><div className="metric"><Timer size={19} /><span className="label">Duration</span><strong>{formatDuration(report.task.durationMs)}</strong></div><div className="metric"><FileCode2 size={19} /><span className="label">Files changed</span><strong>{report.git.summary.changedFiles}</strong><small>+{report.git.summary.additions} / -{report.git.summary.deletions}</small></div><div className="metric"><Check size={19} /><span className="label">Verification</span><strong>{report.tests.filter((test) => test.status === "passed").length}/{report.tests.length} passed</strong></div></div></section>
    <section className="evidence-band" aria-labelledby="screens-title"><div className="band-heading"><span>02</span><h2 id="screens-title">Captured interface</h2><p>Responsive evidence set</p></div><div className="gallery">{report.screenshots.map((shot) => <figure className={`capture ${shot.viewport.name}`} key={shot.id}><ScreenMock kind={shot.viewport.name} /><figcaption><span>{shot.viewport.name}</span><small>{shot.viewport.width} x {shot.viewport.height}</small></figcaption></figure>)}</div><div className="comparison" aria-label="Before and after comparison"><div className="compare-before"><span>BEFORE</span><div className="compare-ui before-ui"><b /><i /><i /><i /></div></div><div className="compare-after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><span>AFTER</span><div className="compare-ui after-ui"><b /><i /><i /><i /></div></div><input aria-label="Comparison position" type="range" min="0" max="100" step="1" value={comparison} onInput={(event) => setComparisonValue(Number(event.currentTarget.value))} onKeyDown={handleComparisonKey} /><div className="compare-handle" style={{ left: `${comparison}%` }} aria-hidden="true">||</div></div></section>
    <section className="evidence-band split-band"><div className="band-heading"><span>03</span><h2>Change set</h2><p>Unified file evidence</p></div><div className="diff-layout"><nav className="file-list" aria-label="Changed files">{report.git.files.map((file) => <button key={file.path} onClick={() => setSelectedFile(file.path)} className={selectedFile === file.path ? "selected" : ""}><FileCode2 size={16} /><span>{file.path}</span><small>+{file.additions} -{file.deletions}</small></button>)}</nav><pre className="diff-code" aria-label={`Diff for ${selectedFile}`}>{(diffs[selectedFile] ?? diffs["src/App.tsx"]).map((line, index) => <code className={line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : ""} key={`${line}-${index}`}>{line}{"\n"}</code>)}</pre></div></section>
    <section className="evidence-band split-band"><div className="band-heading"><span>04</span><h2>Verification receipts</h2><p>Commands and retained output</p></div><div className="receipts">{report.tests.map((test) => <details key={test.id}><summary><span className={test.status === "passed" ? "status-good" : "status-bad"}>{test.status === "passed" ? <Check size={16} /> : <X size={16} />}</span><code>{test.command}</code><small>{formatDuration(test.durationMs)} / exit {test.exitCode}</small><ChevronDown size={18} /></summary><pre>{test.output}</pre></details>)}</div></section>
    <section className="evidence-band privacy-band"><div className="band-heading"><span>05</span><h2>Privacy review</h2><p>Redaction audit before export</p></div><div className="privacy-content"><div className="privacy-total"><LockKeyhole size={22} /><strong>{report.redaction.totalReplacements} values removed</strong><span>from retained command evidence</span></div><ul>{Object.entries(report.redaction.replacements).map(([kind, count]) => <li key={kind}><span className="redacted-dot" />{kind.replaceAll("-", " ")}<b>{count}</b></li>)}</ul><div className="state-row"><span className="state loading">{loading ? "Preparing local artifact" : "Ready locally"}</span><span className="state success">verified</span><span className="state warning">review before publish</span><span className="state failure">failed command</span><span className="state redacted">redacted</span></div></div></section>
    <section className="export-panel" aria-labelledby="export-title"><div><p className="eyebrow">local export station</p><h2 id="export-title">Package this evidence</h2></div><div className="export-actions"><button onClick={() => exportReport("Self-contained HTML")}><Download size={17} />HTML</button><button onClick={() => exportReport("JSON report")}><FileJson2 size={17} />JSON</button><button onClick={exportCover} disabled={!coverDataUrl || Boolean(coverAssetError)} title={coverAssetError || (coverDataUrl ? "Download self-contained cover" : "Preparing local cover asset")} aria-label={coverAssetError || (coverDataUrl ? "Download self-contained cover" : "Preparing local cover asset")}><Image size={17} />Cover</button><button onClick={() => exportReport("README snippet")}><TerminalSquare size={17} />Snippet</button><button className="publish" onClick={() => setToast("Publishing requires a local confirmation step")}><Upload size={17} />Publish</button></div></section>
  </div>{toast && <div className="toast" role="status">{toast}</div>}</main>;
}
