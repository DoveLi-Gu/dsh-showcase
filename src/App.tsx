import { type KeyboardEvent, useEffect, useState } from "react";
import {
  Check, ChevronDown, Code2, Download, FileCode2, FileJson2, GripVertical, Image, LockKeyhole,
  TerminalSquare, Timer, Upload, X,
} from "lucide-react";
import { demoReport } from "./core/browser";
import { demoDiffs as diffs } from "./core/demo-fixture";

type Theme = "dijiang" | "fish";

const showcaseStages = [
  { id: "PROMPT", label: "提示" },
  { id: "BUILD", label: "构建" },
  { id: "TEST", label: "测试" },
  { id: "CAPTURE", label: "捕获" },
  { id: "SHIP", label: "交付" },
];

function selectedTheme(): Theme {
  return new URLSearchParams(window.location.search).get("theme") === "fish" ? "fish" : "dijiang";
}

function evidenceUrl(imagePath: string) {
  return `/${imagePath.replace(/^[/\\]+/, "").replaceAll("\\", "/")}`;
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

async function createCoverHtml(theme: Theme, dataUrl: string, task: string, files: number, tests: string, redactions: number) {
  const { createStyledPosterHtml } = await import("../plugin/poster-html.js");
  return createStyledPosterHtml({
    locale: "zh-CN",
    theme: theme === "fish" ? "blue-big-fish" : "frontier-signal",
    image: dataUrl.split(",")[1] ?? "",
    projectName: "dsh-showcase",
    task, stages: showcaseStages.map((stage) => stage.label),
    fileCount: files, passedTests: Number(tests.split("/")[0]), testCount: Number(tests.split("/")[1]),
    redactionCount: redactions, taskStatus: demoReport.task.status,
    gitFiles: demoReport.git.files, gitState: "changed",
    gitRange: `${demoReport.git.baseRef}..${demoReport.git.headRef}`,
    testReceipts: demoReport.tests.map((test) => ({ ...test, duration: `${test.durationMs}ms` })),
    posterScreenshots: [], visualProject: true,
    freshnessWarnings: ["演示数据：下载内容不是当前项目的实测报告。"],
  });
}

function downloadText(content: string, mimeType: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type PosterProps = {
  passedTests: number;
};

function LoadingCurtain({ theme }: { theme: Theme }) {
  return <div className={`loading-curtain loading-curtain--${theme}`} role="status" aria-label="正在载入布局证据">
    <div className="loading-curtain__flow" aria-hidden="true"><i /><i /><i /></div>
    <div className="loading-curtain__brand">
      <span className="loading-curtain__mark">DSH</span>
      <strong>dsh-showcase</strong>
      <small>正在汇聚交付证据</small>
    </div>
    <div className="loading-curtain__progress" aria-hidden="true"><i /><i /><i /><i /><i /></div>
  </div>;
}

function OceanAtmosphere() {
  return <div className="ocean-atmosphere" aria-hidden="true">
    <div className="ocean-light ocean-light--one" />
    <div className="ocean-light ocean-light--two" />
    <div className="ocean-current-line ocean-current-line--one" />
    <div className="ocean-current-line ocean-current-line--two" />
    <div className="ocean-bubbles">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
  </div>;
}

function FishPoster({ passedTests }: PosterProps) {
  const report = demoReport;
  return <section className="poster-summary fish-poster" aria-labelledby="poster-title">
    <div className="fish-poster__current current-one" aria-hidden="true" />
    <div className="fish-poster__current current-two" aria-hidden="true" />
    <div className="fish-poster__current current-three" aria-hidden="true" />
    <div className="fish-poster__arc arc-one" aria-hidden="true" />
    <div className="fish-poster__arc arc-two" aria-hidden="true" />
    <div className="fish-poster__light light-one" aria-hidden="true" />
    <div className="fish-poster__light light-two" aria-hidden="true" />
    <div className="fish-poster__bubbles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
    <div className="fish-poster__sparkles" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="fish-poster__portrait" aria-hidden="true"><img className="fish-poster__art" src="/whale-girl-keyvisual.webp" alt="" /></div>
    <div className="fish-poster__whales" aria-hidden="true">
      {["one", "two", "three"].map((name) => <svg className={`fish-whale fish-whale--${name}`} viewBox="0 0 122 56" key={name}>
        <path className="fish-whale__body" d="M15 30C23 17 42 10 61 12c16 1 28 8 34 18-5 11-18 18-34 19-19 1-36-6-46-19Z" />
        <path className="fish-whale__tail" d="M91 28c8-8 17-11 25-7-1 6-5 10-12 13 7 1 11 5 12 11-10 2-18-1-25-8Z" />
        <path className="fish-whale__fin" d="M49 41c8 1 14 6 18 12-9 2-16-1-21-7Z" />
        <circle className="fish-whale__eye" cx="35" cy="27" r="1.8" />
        <path className="fish-whale__spout" d="M54 10c-1-5 2-8 6-10m-5 10c4-4 8-4 11-2" />
      </svg>)}
    </div>
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
  const [showIntro, setShowIntro] = useState(true);
  const [selectedFile, setSelectedFile] = useState("src/App.tsx");
  const [comparison, setComparison] = useState(58);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverDataUrl, setCoverDataUrl] = useState("");
  const [coverAssetError, setCoverAssetError] = useState("");
  const report = demoReport;
  const passedTests = report.tests.filter((test) => test.status === "passed").length;

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let disposed = false;
    if (theme === "dijiang") {
      setCoverDataUrl("inline");
      setCoverAssetError("");
      return () => { disposed = true; };
    }
    const path = "/whale-girl-keyvisual.webp";
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
    if (label === "网页") { exportCover(); return; }
    if (label === "数据") downloadText(JSON.stringify(report, null, 2), "application/json", "dsh-showcase-demo-report.json");
    else downloadText(`# dsh-showcase 演示报告\n\n${report.task.goal}\n\n演示数据，不代表当前项目的验证结果。\n\n${report.tests.map((test) => `- ${test.command}: ${test.status} (exit ${test.exitCode})`).join("\n")}\n`, "text/markdown", "dsh-showcase-demo-summary.md");
    setToast(`${label}已下载到本地`);
  };
  const exportCover = async () => {
    setLoading(true);
    try {
      if (coverAssetError) { setToast(`海报导出失败：${coverAssetError}`); return; }
      if (!coverDataUrl) { setToast("本地海报素材正在准备中。"); return; }
      const documentHtml = await createCoverHtml(theme, coverDataUrl, report.task.goal, report.git.summary.changedFiles, `${passedTests}/${report.tests.length}`, report.redaction.totalReplacements);
      downloadText(documentHtml, "text/html", `dsh-showcase-${theme}-cover.html`);
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
    {showIntro && <LoadingCurtain theme={theme} />}
    <OceanAtmosphere />
    <div className="workspace">
      <header className="report-header">
        <div className="identity"><span className="mark">DS</span><div><p className="eyebrow">交付证据 / 0017</p><h1>dsh-showcase</h1></div></div>
        <div className="header-meta"><span><Code2 size={15} /> {report.git.baseRef}..{report.git.headRef}</span><span><Timer size={15} /> {new Date(report.generatedAt).toLocaleString("zh-CN")}</span><span className="verified"><Check size={15} /> 已验证</span></div>
        <span className="theme-badge">蓝色大肥鱼</span>
      </header>

      <FishPoster passedTests={passedTests} />

      <section className="evidence-band overview-band reveal-band" aria-labelledby="overview-title"><div className="band-heading"><span>摘要</span><h2 id="overview-title">交付摘要</h2><p>可复现的完成证据</p></div><div className="overview-grid"><div className="goal"><span className="label">任务目标</span><p>{report.task.goal}</p></div><div className="metric"><Timer size={19} /><span className="label">耗时</span><strong>{formatDurationZh(report.task.durationMs)}</strong></div><div className="metric"><FileCode2 size={19} /><span className="label">变更清单</span><strong>{report.git.summary.changedFiles} 个文件</strong><small>+{report.git.summary.additions} / -{report.git.summary.deletions}</small></div><div className="metric"><Check size={19} /><span className="label">验证结果</span><strong>{passedTests}/{report.tests.length} 已通过</strong></div></div></section>
      <section className="evidence-band reveal-band" aria-labelledby="screens-title">
        <div className="band-heading"><span>界面</span><h2 id="screens-title">界面证据</h2><p>响应式视口采集</p></div>
        <div className="gallery">{report.screenshots.map((shot) => <figure className={`capture ${shot.viewport.name}`} key={shot.id}>
          <div className="capture-frame"><img src={evidenceUrl(shot.imagePath)} alt={`${shot.label}，${shot.viewport.width} x ${shot.viewport.height}`} width={shot.viewport.width} height={shot.viewport.height} loading="lazy" decoding="async" /></div>
          <figcaption><span>{viewportName(shot.viewport.name)}</span><small>{shot.viewport.width} x {shot.viewport.height}</small></figcaption>
        </figure>)}</div>
        <div className="comparison" aria-label="改版前后真实截图对比">
          <div className="compare-before"><span className="compare-label">改版前</span><img src="/evidence/before-desktop.png" alt="改版前的桌面端报告界面" width="1440" height="900" loading="lazy" decoding="async" /></div>
          <div className="compare-after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><span className="compare-label">改版后</span><img src={evidenceUrl(report.screenshots[0].imagePath)} alt="改版后的桌面端报告界面" width="1440" height="900" loading="lazy" decoding="async" /></div>
          <input aria-label="调整改版前后对比位置" type="range" min="0" max="100" step="1" value={comparison} onInput={(event) => setComparisonValue(Number(event.currentTarget.value))} onKeyDown={handleComparisonKey} />
          <div className="compare-handle" style={{ left: `${comparison}%` }} aria-hidden="true"><GripVertical size={17} strokeWidth={3} /></div>
        </div>
      </section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>代码</span><h2>变更清单</h2><p>统一 Diff 证据</p></div><div className="diff-layout"><nav className="file-list" aria-label="已变更文件">{report.git.files.map((file) => <button key={file.path} onClick={() => setSelectedFile(file.path)} className={selectedFile === file.path ? "selected" : ""}><FileCode2 size={16} /><span>{file.path}</span><small>+{file.additions} -{file.deletions}</small></button>)}</nav><pre className="diff-code" aria-label={`${selectedFile} 的 Diff`}>{(diffs[selectedFile] ?? diffs["src/App.tsx"]).map((line, index) => <code className={line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : ""} key={`${line}-${index}`}>{line}{"\n"}</code>)}</pre></div></section>
      <section className="evidence-band split-band reveal-band"><div className="band-heading"><span>验证</span><h2>验证回执</h2><p>命令与保留输出</p></div><div className="receipts">{report.tests.map((test) => <details key={test.id}><summary><span className={test.status === "passed" ? "status-good" : "status-bad"}>{test.status === "passed" ? <Check size={16} /> : <X size={16} />}</span><code>{test.command}</code><small>{formatDurationZh(test.durationMs)} / 退出码 {test.exitCode}</small><ChevronDown size={18} /></summary><pre>{test.output}</pre></details>)}</div></section>
      <section className="evidence-band privacy-band reveal-band"><div className="band-heading"><span>隐私</span><h2>隐私审查</h2><p>导出前的脱敏审计</p></div><div className="privacy-content"><div className="privacy-total"><LockKeyhole size={22} /><strong>已移除 {report.redaction.totalReplacements} 项值</strong><span>来自保留的命令证据</span></div><ul>{Object.entries(report.redaction.replacements).map(([kind, count]) => <li key={kind}><span className="redacted-dot" />{kind.replaceAll("-", " ")}<b>{count}</b></li>)}</ul><div className="state-row"><span className="state loading">{loading ? "准备中" : "准备就绪"}</span><span className="state success">已验证</span><span className="state warning">需要复核</span><span className="state failure">执行失败</span><span className="state redacted">已脱敏</span></div></div></section>
      <section className="export-panel reveal-band" aria-labelledby="export-title"><div><p className="eyebrow">本地导出站</p><h2 id="export-title">导出证据</h2></div><div className="export-actions"><button onClick={() => exportReport("网页")}><Download size={17} />网页</button><button onClick={() => exportReport("数据")}><FileJson2 size={17} />数据</button><button onClick={exportCover} disabled={!coverDataUrl || Boolean(coverAssetError)} title={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")} aria-label={coverAssetError || (coverDataUrl ? "下载自包含海报" : "正在准备本地海报素材")}><Image size={17} />海报</button><button onClick={() => exportReport("README 片段")}><TerminalSquare size={17} />README 片段</button><button className="publish" onClick={() => setToast("发布前需要在本地确认")}><Upload size={17} />发布</button></div></section>
    </div>{toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}
