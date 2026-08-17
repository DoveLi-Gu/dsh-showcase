import { type KeyboardEvent, useEffect, useState } from "react";
import {
  Check, ChevronDown, Code2, Download, FileCode2, FileJson2, Image, LockKeyhole,
  TerminalSquare, Timer, Upload, X,
} from "lucide-react";
import { demoReport } from "./core/browser";

type Theme = "field" | "fish";

const diffs: Record<string, string[]> = {
  "src/App.tsx": ["@@ -1,8 +1,42 @@", "-export default function App() {", "-  return <main>Ready</main>;", "+export default function App() {", "+  return <ReportWorkspace report={demoReport} />;", "+}", "+", "+function ReportWorkspace() {", "+  return <main className=\"report-shell\">...</main>;", "+}"],
  "src/styles.css": ["@@ -0,0 +1,96 @@", "+:root {", "+  --signal: #f6c344;", "+  --surface: #15191a;", "+}", "+.operations-rail {", "+  display: grid;", "+  grid-template-columns: repeat(5, 1fr);", "+}"],
};

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
    reader.onerror = () => reject(new Error("本地海报素材无法读取。"));
    reader.readAsDataURL(blob);
  });
}


const showcaseStages = [
  { id: "PROMPT", label: "提示" },
  { id: "BUILD", label: "构建" },
  { id: "TEST", label: "测试" },
  { id: "CAPTURE", label: "捕获" },
  { id: "SHIP", label: "交付" },
];

function createCoverHtml(dataUrl: string, task: string, files: number, tests: string, redactions: number, viewports: string) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>dsh-showcase 交付海报</title><style>*{box-sizing:border-box}body{margin:0;background:#061925;color:#edf8f8;font-family:"Microsoft YaHei UI","Noto Sans SC",sans-serif}.cover{width:1600px;height:900px;position:relative;overflow:hidden;padding:82px 96px;background:linear-gradient(90deg,#061925 0%,#061925 45%,rgba(6,25,37,.78) 60%,rgba(6,25,37,.08) 76%,transparent),url('${dataUrl}') right center/auto 100% no-repeat}.content{position:relative;z-index:1;width:54%}.eyebrow{color:#65d4c2;font:700 16px monospace;letter-spacing:2px}.title{margin:14px 0;font-size:62px;line-height:1}.task{max-width:770px;color:#d7eaee;font-size:24px;line-height:1.4}.verified{display:inline-block;margin:20px 0;padding:9px 13px;background:#65d4c2;color:#06201f;font-weight:800}.rail{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #4e8391;background:rgba(5,23,36,.72)}.rail span{min-height:60px;padding:18px 10px;border-right:1px solid #4e8391;font-weight:800;text-align:center}.rail span:last-child{border:0}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.metric{border-left:3px solid #65d4c2;background:rgba(5,23,36,.75);padding:12px}.metric b{display:block;font-size:28px}.metric small,.viewports{color:#b9d1d8;font-family:monospace}.viewports{margin-top:16px}.footer{position:absolute;left:96px;bottom:54px;color:#65d4c2;font:700 15px monospace;letter-spacing:1px}</style></head><body><main class="cover"><div class="content"><div class="eyebrow">交付证据 / 本地报告</div><h1 class="title">dsh-showcase</h1><p class="task">${escapeCoverHtml(task)}</p><div class="verified">已验证</div><div class="rail"><span>提示</span><span>构建</span><span>测试</span><span>捕获</span><span>交付</span></div><div class="metrics"><div class="metric"><b>${files}</b><small>改动文件</small></div><div class="metric"><b>${tests}</b><small>通过测试</small></div><div class="metric"><b>${redactions}</b><small>已脱敏</small></div></div><div class="viewports">${escapeCoverHtml(viewports)}</div></div><div class="footer">仅在本地生成 / 不会上传</div></main></body></html>`;
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
  const passedTests = report.tests.filter((test) => test.status === "passed").length;

  useEffect(() => { localStorage.setItem("dsh-theme", theme); }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let disposed = false;
    fetch("/whale-girl-poster.webp")
      .then((response) => {
        if (!response.ok) throw new Error(`素材请求返回 ${response.status}`);
        return response.blob();
      })
      .then(blobAsDataUrl)
      .then((dataUrl) => { if (!disposed) setCoverDataUrl(dataUrl); })
      .catch((error: unknown) => { if (!disposed) setCoverAssetError(error instanceof Error ? error.message : "本地海报素材无法加载。"); });
    return () => { disposed = true; };
  }, []);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(".reveal-band").forEach((band) => band.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: 0.12 });
    const bands = document.querySelectorAll<HTMLElement>(".reveal-band");
    bands.forEach((band) => observer.observe(band));
    return () => observer.disconnect();
  }, []);

  const formatDurationZh = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes} 分 ${seconds.toString().padStart(2, "0")} 秒`;
  };
  const viewportName = (name: string) => ({ desktop: "桌面端", tablet: "平板端", mobile: "移动端" }[name] ?? name);
  const exportReport = (label: string) => {
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setToast(`${label}已在本地准备完成`); }, 420);
  };
  const exportCover = () => {
    setLoading(true);
    try {
      if (coverAssetError) { setToast(`海报导出失败：${coverAssetError}`); return; }
      if (!coverDataUrl) { setToast("本地海报素材正在准备中。"); return; }
      const viewports = report.screenshots.map((shot) => `${viewportName(shot.viewport.name)} ${shot.viewport.width}x${shot.viewport.height}`).join(" / ");
      const documentHtml = createCoverHtml(coverDataUrl, report.task.goal, report.git.summary.changedFiles, `${passedTests}/${report.tests.length}`, report.redaction.totalReplacements, viewports);
      const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "dsh-showcase-cover.html";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast("自包含海报已下载到本地");
    } catch (error) {
      setToast(`海报导出失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };
  const setComparisonValue = (value: number) => setComparison(Math.max(0, Math.min(100, value)));
  const handleComparisonKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 100 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? comparison - 1 : event.key === "ArrowRight" || event.key === "ArrowUp" ? comparison + 1 : null;
    if (next !== null) { event.preventDefault(); setComparisonValue(next); }
  };

  return <main className={`app theme-${theme}`}>
    <div className="workspace">
      <header className="report-header">
        <div className="identity"><span className="mark">DS</span><div><p className="eyebrow">交付证据 / 0017</p><h1>dsh-showcase</h1></div></div>
        <div className="header-meta"><span><Code2 size={15} /> {report.git.baseRef}..{report.git.headRef}</span><span><Timer size={15} /> {new Date(report.generatedAt).toLocaleString("zh-CN")}</span><span className="verified"><Check size={15} /> 已验证</span></div>
        <div className="theme-switch" role="group" aria-label="报告主题"><button className={theme === "field" ? "active" : ""} onClick={() => setTheme("field")} aria-pressed={theme === "field"}>边境信号</button><button className={theme === "fish" ? "active" : ""} onClick={() => setTheme("fish")} aria-pressed={theme === "fish"}>蓝色大肥鱼</button></div>
      </header>

      <section className="poster-summary" key={theme} aria-labelledby="poster-title">
        <div className="poster-atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /><i /><b /></div>
        {theme === "fish" && <img className="fish-character" src="/whale-girl-poster.webp" alt="" />}
        <aside className="field-telemetry" aria-hidden="true"><b>05</b><span>交付阶段</span><i /><strong>+{report.git.summary.additions}</strong><small>新增行数</small><strong>{passedTests}/{report.tests.length}</strong><small>验证通过</small></aside>
        <div className="poster-content">
          <p className="poster-kicker">交付证据 / 本地报告</p><h2 id="poster-title">dsh-showcase</h2><p className="poster-goal">{report.task.goal}</p>
          <span className="poster-verified"><Check size={16} /> 已验证</span>
          <div className="poster-rail" aria-label="交付阶段">{showcaseStages.map((stage, index) => <span className={index === showcaseStages.length - 1 ? "current" : "complete"} key={stage.id} data-stage={stage.id}><small>{String(index + 1).padStart(2, "0")}</small>{stage.label}</span>)}</div>
          <div className="poster-metrics"><div><strong>{report.git.summary.changedFiles}</strong><span>改动文件</span></div><div><strong>{passedTests}/{report.tests.length}</strong><span>通过测试</span></div><div><strong>{report.redaction.totalReplacements}</strong><span>已脱敏</span></div></div>
          <p className="poster-viewports">{report.screenshots.map((shot) => `${viewportName(shot.viewport.name)} ${shot.viewport.width}x${shot.viewport.height}`).join(" / ")}</p>
        </div><p className="poster-footer">仅在本地生成 / 不会上传</p>
      </section>

      <section className="evidence-band overview-band reveal-band" aria-labelledby="overview-title"><div className="band-heading"><span>01</span><h2 id="overview-title">交付摘要</h2><p>可复现的完成证据</p></div><div className="overview-grid"><div className="goal"><span className="label">任务目标</span><p>{report.task.goal}</p></div><div className="metric"><Timer size={19} /><span className="label">耗时</span><strong>{formatDurationZh(report.task.durationMs)}</strong></div><div className="metric"><FileCode2 size={19} /><span className="label">变更清单</span><strong>{report.git.summary.changedFiles} 个文件</strong><small>+{report.git.summary.additions} / -{report.git.summary.deletions}</small></div><div className="metric"><Check size={19} /><span className="label">验证结果</span><strong>{passedTests}/{report.tests.length} 已通过</strong></div></div></section>
      <section className="evidence-band reveal-band" aria-labelledby="screens-title"><div className="band-heading"><span>02</span><h2 id="screens-title">界面证据</h2><p>响应式视口采集</p></div><div className="gallery">{report.screenshots.map((shot) => <figure className={`capture ${shot.viewport.name}`} key={shot.id}><ScreenMock kind={shot.viewport.name} /><figcaption><span>{viewportName(shot.viewport.name)}</span><small>{shot.viewport.width} x {shot.viewport.height}</small></figcaption></figure>)}</div><div className="comparison" aria-label="改版前后对比"><div className="compare-before"><span>改版前</span><div className="compare-ui before-ui"><b /><i /><i /><i /></div></div><div className="compare-after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><span>改版后</span><div className="compare-ui after-ui"><b /><i /><i /><i /></div></div><input aria-label="对比位置" type="range" min="0" max="100" step="1" value={comparison} onInput={(event) => setComparisonValue(Number(event.currentTarget.value))} onKeyDown={handleComparisonKey} /><div className="compare-handle" style={{ left: `${comparison}%` }} aria-hidden="true">||</div></div></section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>03</span><h2>变更清单</h2><p>统一 Diff 证据</p></div><div className="diff-layout"><nav className="file-list" aria-label="已变更文件">{report.git.files.map((file) => <button key={file.path} onClick={() => setSelectedFile(file.path)} className={selectedFile === file.path ? "selected" : ""}><FileCode2 size={16} /><span>{file.path}</span><small>+{file.additions} -{file.deletions}</small></button>)}</nav><pre className="diff-code" aria-label={`${selectedFile} 的 Diff`}>{(diffs[selectedFile] ?? diffs["src/App.tsx"]).map((line, index) => <code className={line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : ""} key={`${line}-${index}`}>{line}{"\n"}</code>)}</pre></div></section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>04</span><h2>验证回执</h2><p>命令与保留输出</p></div><div className="receipts">{report.tests.map((test) => <details key={test.id}><summary><span className={test.status === "passed" ? "status-good" : "status-bad"}>{test.status === "passed" ? <Check size={16} /> : <X size={16} />}</span><code>{test.command}</code><small>{formatDurationZh(test.durationMs)} / 退出码 {test.exitCode}</small><ChevronDown size={18} /></summary><pre>{test.output}</pre></details>)}</div></section>
      <section className="evidence-band privacy-band reveal-band"><div className="band-heading"><span>05</span><h2>隐私审查</h2><p>导出前的脱敏审计</p></div><div className="privacy-content"><div className="privacy-total"><LockKeyhole size={22} /><strong>已移除 {report.redaction.totalReplacements} 项值</strong><span>来自保留的命令证据</span></div><ul>{Object.entries(report.redaction.replacements).map(([kind, count]) => <li key={kind}><span className="redacted-dot" />{kind.replaceAll("-", " ")}<b>{count}</b></li>)}</ul><div className="state-row"><span className="state loading">{loading ? "准备中" : "准备就绪"}</span><span className="state success">已验证</span><span className="state warning">需要复核</span><span className="state failure">执行失败</span><span className="state redacted">已脱敏</span></div></div></section>
      <section className="export-panel reveal-band" aria-labelledby="export-title"><div><p className="eyebrow">本地导出站</p><h2 id="export-title">导出证据</h2></div><div className="export-actions"><button onClick={() => exportReport("网页")}><Download size={17} />网页</button><button onClick={() => exportReport("数据")}><FileJson2 size={17} />数据</button><button onClick={exportCover} disabled={!coverDataUrl || Boolean(coverAssetError)} title={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")} aria-label={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")}><Image size={17} />海报</button><button onClick={() => exportReport("README 片段")}><TerminalSquare size={17} />README 片段</button><button className="publish" onClick={() => setToast("发布前需要在本地确认")}><Upload size={17} />发布</button></div></section>
    </div>{toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}
