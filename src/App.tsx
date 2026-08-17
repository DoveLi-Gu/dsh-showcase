import { type KeyboardEvent, useEffect, useState } from "react";
import {
  Check, ChevronDown, Code2, Download, FileCode2, FileJson2, Image, LockKeyhole,
  TerminalSquare, Timer, Upload, X,
} from "lucide-react";
import { demoReport } from "./core/browser";

type Theme = "field" | "fish";

const diffs: Record<string, string[]> = {
  "src/App.tsx": ["@@ -1,8 +1,42 @@", "-export default function App() {", "-  return <main>Ready</main>;", "+export default function App() {", "+  return <ReportWorkspace report={demoReport} />;", "+}", "+", "+function ReportWorkspace() {", "+  return <main className=\"report-shell\">...</main>;", "+}"],
  "src/styles.css": ["@@ -0,0 +1,96 @@", "+:root {", "+  --signal: #d7ef2f;", "+  --surface: #f0f2ed;", "+}", "+.poster-summary {", "+  isolation: isolate;", "+  overflow: hidden;", "+}"],
};

const showcaseStages = [
  { id: "PROMPT", label: "提示" },
  { id: "BUILD", label: "构建" },
  { id: "TEST", label: "测试" },
  { id: "CAPTURE", label: "捕获" },
  { id: "SHIP", label: "交付" },
];

function selectedTheme(): Theme {
  return new URLSearchParams(window.location.search).get("theme") === "fish" ? "fish" : "field";
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
    reader.onerror = () => reject(new Error("本地海报素材无法读取。"));
    reader.readAsDataURL(blob);
  });
}

function viewportText() {
  const labels: Record<string, string> = { desktop: "桌面端", tablet: "平板端", mobile: "移动端" };
  return demoReport.screenshots.map((shot) => `${labels[shot.viewport.name] ?? shot.viewport.name} ${shot.viewport.width}x${shot.viewport.height}`).join(" / ");
}

function createCoverHtml(theme: Theme, dataUrl: string, task: string, files: number, tests: string, redactions: number, viewports: string) {
  const stages = showcaseStages.map((stage, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b>${stage.label}</span>`).join("");
  const safeTask = escapeCoverHtml(task);
  const safeViewports = escapeCoverHtml(viewports);
  const shared = `*{box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}body{margin:0;font-family:"Microsoft YaHei UI","Noto Sans SC",sans-serif}.poster{position:relative;width:1600px;height:900px;overflow:hidden}.mono{font-family:"Cascadia Mono","Microsoft YaHei UI",monospace}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important}}`;

  if (theme === "field") {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>dsh-showcase 边境信号海报</title><style>${shared}
body{background:#e9ece7;color:#101310}.poster{background:#eff1ec}.photo{position:absolute;inset:-5% 26% -5% 38%;background:url("${dataUrl}") center 48%/cover no-repeat;filter:grayscale(1) contrast(1.2)}.photo:after{content:"";position:absolute;inset:0;background:rgba(239,241,236,.14)}.slash{position:absolute;inset:-14% 25% -14% 33%;background:#d7ef2f;clip-path:polygon(58% 0,100% 0,66% 100%,0 100%);mix-blend-mode:multiply;opacity:.92}.mast{position:absolute;left:72px;right:72px;top:52px;display:flex;justify-content:space-between;border-top:8px solid #111;padding-top:13px;font:800 17px monospace}.ghost{position:absolute;right:-22px;top:78px;color:#111;font:900 248px/.75 Impact,"Microsoft YaHei UI",sans-serif;writing-mode:vertical-rl;opacity:.08}.copy{position:absolute;z-index:3;left:72px;top:164px;width:665px}.kicker{display:inline-block;background:#111;color:#fff;padding:8px 13px;font:800 16px monospace}.title{margin:23px 0 13px;font:900 80px/.88 "Arial Narrow","Microsoft YaHei UI",sans-serif;letter-spacing:0;max-width:650px}.task{margin:0;width:590px;font-size:28px;line-height:1.4;font-weight:700}.verified{display:inline-flex;margin-top:25px;background:#d7ef2f;padding:12px 17px;font:900 18px monospace}.rail{position:absolute;z-index:4;left:72px;right:72px;bottom:68px;display:grid;grid-template-columns:repeat(5,1fr);background:#111;color:#fff}.rail span{position:relative;padding:17px 18px 18px;border-right:1px solid #5b625d;font-weight:900}.rail span:last-child{background:#d7ef2f;color:#111;border:0}.rail b{display:block;margin-bottom:6px;color:#aeb7b0;font:12px monospace}.rail span:last-child b{color:#536000}.metrics{position:absolute;z-index:5;right:77px;bottom:169px;width:360px;background:#111;color:#fff;padding:22px 26px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.metrics b{display:block;font:900 34px monospace}.metrics small{font:700 13px "Microsoft YaHei UI"}.stamp{position:absolute;z-index:5;right:73px;top:142px;border:6px solid #ed4035;color:#ed4035;padding:12px 16px;transform:rotate(-4deg);font:900 24px/1 "Microsoft YaHei UI"}.footer{position:absolute;left:72px;bottom:31px;font:800 14px monospace}.scan{position:absolute;z-index:2;inset:0 auto 0 -18%;width:14%;background:rgba(215,239,47,.28);transform:skewX(-16deg);animation:scan 8s linear infinite}@keyframes scan{to{transform:translateX(1900px) skewX(-16deg)}}</style></head><body><article class="poster"><div class="photo"></div><div class="slash"></div><div class="scan"></div><div class="mast"><span>DSH / 交付证据</span><span>报告 0017 / 本地生成</span></div><div class="ghost">交付</div><div class="copy"><div class="kicker">边境信号 / 任务完成</div><h1 class="title">dsh-showcase</h1><p class="task">${safeTask}</p><div class="verified">✓ 已验证</div></div><div class="stamp">可交付</div><div class="metrics"><div><b>${files}</b><small>改动文件</small></div><div><b>${tests}</b><small>通过测试</small></div><div><b>${redactions}</b><small>已脱敏</small></div></div><div class="rail">${stages}</div><div class="footer mono">${safeViewports} / 仅在本地生成</div></article></body></html>`;
  }

  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>dsh-showcase 蓝色大肥鱼海报</title><style>${shared}
body{background:#f8fbff;color:#10245c}.poster{background:#fff}.art{position:absolute;right:-12px;bottom:-25px;width:850px;height:950px;object-fit:contain;object-position:right bottom;animation:float 8s ease-in-out infinite}.cover{position:absolute;z-index:2;inset:0 42% 0 0;background:#fff;clip-path:polygon(0 0,100% 0,85% 100%,0 100%)}.arc{position:absolute;border:5px solid #1767e8;border-left-color:transparent;border-bottom-color:transparent;border-radius:50%;animation:spin 18s linear infinite}.a1{width:520px;height:520px;right:112px;top:84px}.a2{width:680px;height:680px;right:-70px;top:32px;border-width:2px;animation-direction:reverse}.copy{position:absolute;z-index:4;left:82px;top:74px;width:700px}.kicker{display:inline-flex;background:#ffd24a;color:#10245c;padding:9px 14px;font:900 17px "Microsoft YaHei UI";transform:rotate(-1deg)}.title{margin:26px 0 14px;color:#0757cf;font:900 92px/.82 Impact,"Microsoft YaHei UI",sans-serif}.title span{display:block}.task{width:600px;margin:0;color:#172d66;font-size:27px;line-height:1.42;font-weight:800}.verified{display:inline-flex;margin-top:25px;border:5px solid #10245c;background:#fff;padding:10px 17px;color:#10245c;font:900 20px "Microsoft YaHei UI";box-shadow:9px 9px 0 #ffd24a;transform:rotate(1deg)}.pop{position:absolute;z-index:5;color:#fff;background:#0757cf;padding:12px 18px;font:900 20px "Microsoft YaHei UI";box-shadow:6px 6px 0 #ffd24a}.p1{right:78px;top:75px;transform:rotate(4deg)}.p2{right:645px;bottom:204px;transform:rotate(-3deg)}.metrics{position:absolute;z-index:5;left:83px;bottom:157px;display:flex;gap:18px}.metric{min-width:150px;border:4px solid #0757cf;background:#fff;padding:14px 17px;transform:rotate(-2deg)}.metric:nth-child(2){transform:rotate(2deg);background:#e8f1ff}.metric:nth-child(3){transform:rotate(-1deg);background:#ffd24a}.metric b{display:block;font:900 34px monospace}.metric small{font:900 13px "Microsoft YaHei UI"}.rail{position:absolute;z-index:6;left:72px;right:72px;bottom:52px;display:flex;gap:8px}.rail span{flex:1;background:#0757cf;color:#fff;padding:13px 15px;font-weight:900;clip-path:polygon(0 0,94% 0,100% 100%,6% 100%)}.rail span:last-child{background:#ffd24a;color:#10245c}.rail b{display:block;font:12px monospace;opacity:.72}.footer{position:absolute;z-index:5;right:75px;bottom:19px;color:#0757cf;font:800 14px monospace}@keyframes float{50%{transform:translateY(-8px) rotate(.35deg)}}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><article class="poster"><div class="arc a1"></div><div class="arc a2"></div><img class="art" src="${dataUrl}" alt=""><div class="cover"></div><div class="copy"><div class="kicker">蓝色大肥鱼 / 证据新鲜出炉</div><h1 class="title"><span>dsh</span><span>showcase</span></h1><p class="task">${safeTask}</p><div class="verified">✓ 全部验证完成</div></div><div class="pop p1">交付完成!</div><div class="pop p2">本地生成</div><div class="metrics"><div class="metric"><b>${files}</b><small>改动文件</small></div><div class="metric"><b>${tests}</b><small>通过测试</small></div><div class="metric"><b>${redactions}</b><small>已脱敏</small></div></div><div class="rail">${stages}</div><div class="footer mono">${safeViewports}</div></article></body></html>`;
}

type PosterProps = {
  passedTests: number;
};

function FieldPoster({ passedTests }: PosterProps) {
  const report = demoReport;
  return <section className="poster-summary field-poster" aria-labelledby="poster-title">
    <img className="field-poster__photo" src="/frontier-industrial.webp" alt="" />
    <div className="field-poster__slash" aria-hidden="true" />
    <div className="field-poster__scan" aria-hidden="true" />
    <div className="field-poster__mast"><span>DSH / 交付证据</span><span>报告 0017 / 本地生成</span></div>
    <span className="field-poster__ghost" aria-hidden="true">交付</span>
    <div className="field-poster__copy">
      <p className="field-poster__kicker">边境信号 / 任务完成</p>
      <h2 id="poster-title">dsh-showcase</h2>
      <p className="field-poster__goal">{report.task.goal}</p>
      <span className="field-poster__verified"><Check size={18} /> 已验证</span>
    </div>
    <span className="field-poster__stamp">可交付</span>
    <div className="field-poster__metrics"><div><strong>{report.git.summary.changedFiles}</strong><span>改动文件</span></div><div><strong>{passedTests}/{report.tests.length}</strong><span>通过测试</span></div><div><strong>{report.redaction.totalReplacements}</strong><span>已脱敏</span></div></div>
    <div className="field-poster__rail" aria-label="交付阶段">{showcaseStages.map((stage, index) => <span className={index === showcaseStages.length - 1 ? "current" : "complete"} key={stage.id}><small>{String(index + 1).padStart(2, "0")}</small>{stage.label}</span>)}</div>
    <p className="field-poster__footer">{viewportText()} / 仅在本地生成</p>
  </section>;
}

function FishPoster({ passedTests }: PosterProps) {
  const report = demoReport;
  return <section className="poster-summary fish-poster" aria-labelledby="poster-title">
    <div className="fish-poster__arc arc-one" aria-hidden="true" />
    <div className="fish-poster__arc arc-two" aria-hidden="true" />
    <div className="fish-poster__sparkles" aria-hidden="true"><i /><i /><i /><i /></div>
    <img className="fish-poster__art" src="/whale-girl-keyvisual.webp" alt="" />
    <div className="fish-poster__cover" aria-hidden="true" />
    <div className="fish-poster__copy">
      <p className="fish-poster__kicker">蓝色大肥鱼 / 证据新鲜出炉</p>
      <h2 id="poster-title"><span>dsh</span><span>showcase</span></h2>
      <p className="fish-poster__goal">{report.task.goal}</p>
      <span className="fish-poster__verified"><Check size={18} /> 全部验证完成</span>
    </div>
    <span className="fish-poster__pop pop-one">交付完成!</span>
    <span className="fish-poster__pop pop-two">本地生成</span>
    <div className="fish-poster__metrics"><div><strong>{report.git.summary.changedFiles}</strong><span>改动文件</span></div><div><strong>{passedTests}/{report.tests.length}</strong><span>通过测试</span></div><div><strong>{report.redaction.totalReplacements}</strong><span>已脱敏</span></div></div>
    <div className="fish-poster__rail" aria-label="交付阶段">{showcaseStages.map((stage, index) => <span className={index === showcaseStages.length - 1 ? "current" : "complete"} key={stage.id}><small>{String(index + 1).padStart(2, "0")}</small>{stage.label}</span>)}</div>
    <p className="fish-poster__footer">{viewportText()}</p>
  </section>;
}

export default function App() {
  const theme = selectedTheme();
  const [selectedFile, setSelectedFile] = useState("src/App.tsx");
  const [comparison, setComparison] = useState(58);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverDataUrl, setCoverDataUrl] = useState("");
  const [coverAssetError, setCoverAssetError] = useState("");
  const report = demoReport;
  const passedTests = report.tests.filter((test) => test.status === "passed").length;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let disposed = false;
    const path = theme === "fish" ? "/whale-girl-keyvisual.webp" : "/frontier-industrial.webp";
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`素材请求返回 ${response.status}`);
        return response.blob();
      })
      .then(blobAsDataUrl)
      .then((dataUrl) => { if (!disposed) setCoverDataUrl(dataUrl); })
      .catch((error: unknown) => { if (!disposed) setCoverAssetError(error instanceof Error ? error.message : "本地海报素材无法加载。"); });
    return () => { disposed = true; };
  }, [theme]);
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
      const documentHtml = createCoverHtml(theme, coverDataUrl, report.task.goal, report.git.summary.changedFiles, `${passedTests}/${report.tests.length}`, report.redaction.totalReplacements, viewports);
      const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `dsh-showcase-${theme}-cover.html`;
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
        <span className="theme-badge">{theme === "field" ? "边境信号" : "蓝色大肥鱼"}</span>
      </header>

      {theme === "field" ? <FieldPoster passedTests={passedTests} /> : <FishPoster passedTests={passedTests} />}

      <section className="evidence-band overview-band reveal-band" aria-labelledby="overview-title"><div className="band-heading"><span>摘要</span><h2 id="overview-title">交付摘要</h2><p>可复现的完成证据</p></div><div className="overview-grid"><div className="goal"><span className="label">任务目标</span><p>{report.task.goal}</p></div><div className="metric"><Timer size={19} /><span className="label">耗时</span><strong>{formatDurationZh(report.task.durationMs)}</strong></div><div className="metric"><FileCode2 size={19} /><span className="label">变更清单</span><strong>{report.git.summary.changedFiles} 个文件</strong><small>+{report.git.summary.additions} / -{report.git.summary.deletions}</small></div><div className="metric"><Check size={19} /><span className="label">验证结果</span><strong>{passedTests}/{report.tests.length} 已通过</strong></div></div></section>
      <section className="evidence-band reveal-band" aria-labelledby="screens-title"><div className="band-heading"><span>界面</span><h2 id="screens-title">界面证据</h2><p>响应式视口采集</p></div><div className="gallery">{report.screenshots.map((shot) => <figure className={`capture ${shot.viewport.name}`} key={shot.id}><ScreenMock kind={shot.viewport.name} /><figcaption><span>{viewportName(shot.viewport.name)}</span><small>{shot.viewport.width} x {shot.viewport.height}</small></figcaption></figure>)}</div><div className="comparison" aria-label="改版前后对比"><div className="compare-before"><span>改版前</span><div className="compare-ui before-ui"><b /><i /><i /><i /></div></div><div className="compare-after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><span>改版后</span><div className="compare-ui after-ui"><b /><i /><i /><i /></div></div><input aria-label="对比位置" type="range" min="0" max="100" step="1" value={comparison} onInput={(event) => setComparisonValue(Number(event.currentTarget.value))} onKeyDown={handleComparisonKey} /><div className="compare-handle" style={{ left: `${comparison}%` }} aria-hidden="true">||</div></div></section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>代码</span><h2>变更清单</h2><p>统一 Diff 证据</p></div><div className="diff-layout"><nav className="file-list" aria-label="已变更文件">{report.git.files.map((file) => <button key={file.path} onClick={() => setSelectedFile(file.path)} className={selectedFile === file.path ? "selected" : ""}><FileCode2 size={16} /><span>{file.path}</span><small>+{file.additions} -{file.deletions}</small></button>)}</nav><pre className="diff-code" aria-label={`${selectedFile} 的 Diff`}>{(diffs[selectedFile] ?? diffs["src/App.tsx"]).map((line, index) => <code className={line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : ""} key={`${line}-${index}`}>{line}{"\n"}</code>)}</pre></div></section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>验证</span><h2>验证回执</h2><p>命令与保留输出</p></div><div className="receipts">{report.tests.map((test) => <details key={test.id}><summary><span className={test.status === "passed" ? "status-good" : "status-bad"}>{test.status === "passed" ? <Check size={16} /> : <X size={16} />}</span><code>{test.command}</code><small>{formatDurationZh(test.durationMs)} / 退出码 {test.exitCode}</small><ChevronDown size={18} /></summary><pre>{test.output}</pre></details>)}</div></section>
      <section className="evidence-band privacy-band reveal-band"><div className="band-heading"><span>隐私</span><h2>隐私审查</h2><p>导出前的脱敏审计</p></div><div className="privacy-content"><div className="privacy-total"><LockKeyhole size={22} /><strong>已移除 {report.redaction.totalReplacements} 项值</strong><span>来自保留的命令证据</span></div><ul>{Object.entries(report.redaction.replacements).map(([kind, count]) => <li key={kind}><span className="redacted-dot" />{kind.replaceAll("-", " ")}<b>{count}</b></li>)}</ul><div className="state-row"><span className="state loading">{loading ? "准备中" : "准备就绪"}</span><span className="state success">已验证</span><span className="state warning">需要复核</span><span className="state failure">执行失败</span><span className="state redacted">已脱敏</span></div></div></section>
      <section className="export-panel reveal-band" aria-labelledby="export-title"><div><p className="eyebrow">本地导出站</p><h2 id="export-title">导出证据</h2></div><div className="export-actions"><button onClick={() => exportReport("网页")}><Download size={17} />网页</button><button onClick={() => exportReport("数据")}><FileJson2 size={17} />数据</button><button onClick={exportCover} disabled={!coverDataUrl || Boolean(coverAssetError)} title={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")} aria-label={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")}><Image size={17} />海报</button><button onClick={() => exportReport("README 片段")}><TerminalSquare size={17} />README 片段</button><button className="publish" onClick={() => setToast("发布前需要在本地确认")}><Upload size={17} />发布</button></div></section>
    </div>{toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}
