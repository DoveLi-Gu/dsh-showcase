import { findComparisonPair, formatReportDuration, reportMarkdown, sanitizeReportExport, serializeInlineJson } from "./report-content.js";
import { dijiangConsoleCss } from "./dijiang-style.js";
import { renderDijiangLoader, dijiangMotionScript } from "./dijiang-motion.js";

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

const lucideLicense = "ISC License\n\nCopyright (c) 2026 Lucide Icons and Contributors\n\nPermission to use, copy, modify, and/or distribute this software for any\npurpose with or without fee is hereby granted, provided that the above\ncopyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES\nWITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF\nMERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR\nANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES\nWHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN\nACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF\nOR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.\n\n---\n\nThe following Lucide icons are derived from the Feather project:\n\nairplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out\n\nThe MIT License (MIT) (for the icons listed above)\n\nCopyright (c) 2013-present Cole Bemis\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.";

// Static Lucide icons keep exported reports self-contained without a React runtime.
const icons = {
  "arrow": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-arrow-up-right\" aria-hidden=\"true\"><path d=\"M7 7h10v10\"></path><path d=\"M7 17 17 7\"></path></svg>",
  "download": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-download\" aria-hidden=\"true\"><path d=\"M12 15V3\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m7 10 5 5 5-5\"></path></svg>",
  "copy": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-copy\" aria-hidden=\"true\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>"
};
const isBase64 = (value) => typeof value === "string" && value.length > 0 && value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value);

export function renderDijiangDocument(data, text, status, parts) {
  const en = data.locale === "en";
  const copy = en ? {
    station: "DELIVERY RELAY", archive: "Evidence archive", changes: "Change register", checks: "Verification receipts", capture: "Visual evidence", output: "Local artifacts", overview: "Delivery report", sample: "DEMO DATA", snapshot: "REPORT SNAPSHOT", warnings: "Review queue", noWarnings: "No review warnings recorded", source: "Report", download: "Download HTML", privacy: "Privacy review", verified: "Retained verification output", count: "Recorded", emptyOutput: "No command output recorded.", full: "Download original capture", copyPath: "Copy path", copied: "Copied", copyFailed: "Copy unavailable; select the path below.", remaining: "More records are available in the source report.", local: "LOCAL ONLY", scope: "Verification scope", jump: "Delivery stages", skip: "Skip to evidence", untimed: "Time not recorded",
  } : {
    station: "交付中继", archive: "证据档案", changes: "变更档案", checks: "验证回执", capture: "界面证据", output: "本地产物", overview: "交付报告", sample: "演示数据", snapshot: "报告快照", warnings: "复核队列", noWarnings: "未记录额外复核事项", source: "采集报告", download: "下载 HTML", privacy: "隐私审查", verified: "已保留的验证输出", count: "记录", emptyOutput: "未记录命令输出。", full: "下载原始截图", copyPath: "复制路径", copied: "已复制", copyFailed: "复制不可用，请选择下方路径文本。", remaining: "其余记录见采集报告。", local: "仅本地生成", scope: "凭据覆盖", jump: "交付阶段", skip: "跳到证据", untimed: "未记录时间",
  };
  const files = Array.isArray(data.gitFiles) ? data.gitFiles : [];
  const tests = Array.isArray(data.testReceipts) ? data.testReceipts : [];
  const screenshots = Array.isArray(data.posterScreenshots) ? data.posterScreenshots.filter((shot) => isBase64(shot?.image) && /^image\/(png|jpeg|webp)$/.test(shot.mimeType)) : [];
  const warnings = Array.isArray(data.freshnessWarnings) ? data.freshnessWarnings : [];
  const gitState = data.gitState ?? (files.length ? "changed" : "clean");
  const testState = data.testState ?? (tests.length ? "configured" : "unconfigured");
  const detailCopy = en ? {
    summary: "Delivery summary", duration: "Duration", delta: "Line changes", views: "Captures", diff: "Line diff",
    missing: "No line diff retained in this report.", binary: "Binary file; no text diff.", untracked: "Untracked file; not included in the Git patch.",
    omitted: "Patch omitted by capture limits.", truncated: "Only part of the output is retained.",
    before: "Before", after: "After", compare: "Before / after", position: "Comparison position",
    noPair: "No before and after captures of the same page and viewport.", privacyEmpty: "No redaction breakdown recorded.",
    json: "Download JSON", markdown: "Download Markdown",
  } : {
    summary: "交付摘要", duration: "任务耗时", delta: "增删总量", views: "截图记录", diff: "逐行差异",
    missing: "报告未保留逐行 Diff。", binary: "二进制文件，不展示文本 Diff。", untracked: "未跟踪文件，尚未纳入 Git 差异。",
    omitted: "受采集大小或数量限制，此文件未保留 Diff。", truncated: "仅保留部分输出，内容已截断。",
    before: "改版前", after: "改版后", compare: "前后对比", position: "对比位置",
    noPair: "尚无相同页面、相同视口的改版前后截图。", privacyEmpty: "未记录脱敏分类明细。",
    json: "下载 JSON", markdown: "下载 Markdown",
  };
  const redactionDetails = Array.isArray(data.redactionDetails) ? data.redactionDetails : [];
  const exportReport = sanitizeReportExport(data.reportData ?? {
    version: 1, generatedAt: data.generatedAt, demo: Boolean(data.demo), project: { name: data.projectName },
    task: { goal: data.task, status: status.key, durationMs: data.durationMs },
    git: { files, summary: { changedFiles: data.fileCount, additions: data.additions, deletions: data.deletions } },
    tests, screenshots: screenshots.map(({ image, ...shot }) => shot),
    redaction: { totalReplacements: data.redactionCount, replacements: Object.fromEntries(redactionDetails.map(item => [item.name, item.count])) },
    warnings,
  });
  const exportPayload = serializeInlineJson({ report: exportReport, markdown: data.summaryMarkdown ?? reportMarkdown(exportReport, data.locale) });
  const totals = { additions: data.additions ?? files.reduce((n, f) => n + (Number(f.additions) || 0), 0), deletions: data.deletions ?? files.reduce((n, f) => n + (Number(f.deletions) || 0), 0) };
  const overview = '<section class="ed-section ed-overview" id="ed-overview"><header class="ed-section-head"><h2>' + detailCopy.summary + '</h2></header><dl><div><dt>' + detailCopy.duration + '</dt><dd>' + formatReportDuration(data.durationMs, data.locale) + '</dd></div><div><dt>' + detailCopy.delta + '</dt><dd class="ed-delta"><b>+' + totals.additions + '</b><i>−' + totals.deletions + '</i></dd></div><div><dt>' + detailCopy.views + '</dt><dd>' + screenshots.length + '</dd></div></dl></section>';
  const diffPanels = files.map((file, index) => {
    const reason = file.diffUnavailable === "binary" ? detailCopy.binary : file.diffUnavailable === "untracked" ? detailCopy.untracked : ["oversize", "limit"].includes(file.diffUnavailable) ? detailCopy.omitted : detailCopy.missing;
    const lines = file.diff === undefined ? '<p class="ed-diff-missing">' + reason + '</p>' : '<pre class="ed-diff-code">' + String(file.diff).split(/\r?\n/).map(line => '<code class="ed-diff-line ' + (line.startsWith("@@") ? "hunk" : line.startsWith("+") && !line.startsWith("+++") ? "addition" : line.startsWith("-") && !line.startsWith("---") ? "deletion" : "") + '">' + escape(line) + '\n</code>').join("") + '</pre>';
    return '<section class="ed-diff-panel" id="ed-diff-' + index + '"' + (index ? ' hidden' : '') + ' aria-label="' + escape(file.path) + ' Diff"><header><h3>' + detailCopy.diff + '</h3><code>' + escape(file.previousPath ? file.previousPath + " → " + file.path : file.path) + '</code></header>' + lines + (file.diffTruncated ? '<p class="ed-more">' + detailCopy.truncated + '</p>' : '') + '</section>';
  }).join("");
  const privacy = '<section class="ed-section ed-privacy" id="ed-privacy"><header class="ed-section-head"><h2>' + copy.privacy + '</h2><span>' + (Number(data.redactionCount) || 0) + ' ' + text.redactions + '</span></header>' + (redactionDetails.length ? '<dl>' + redactionDetails.map(item => '<div><dt>' + escape(item.name) + '</dt><dd>' + (Number(item.count) || 0) + '</dd></div>').join("") + '</dl>' : '<p class="ed-more">' + detailCopy.privacyEmpty + '</p>') + '</section>';
  const pair = findComparisonPair(screenshots);
  const comparison = '<div class="ed-comparison"><h3>' + detailCopy.compare + '</h3>' + (pair ? '<div class="ed-comparison-stage" data-ed-comparison data-before="ed-shot-' + screenshots.indexOf(pair.before) + '" data-after="ed-shot-' + screenshots.indexOf(pair.after) + '"><span class="ed-compare-label">' + detailCopy.before + '</span><span class="ed-compare-label ed-compare-label--after">' + detailCopy.after + '</span><div class="ed-compare-before" data-ed-derived></div><div class="ed-compare-after" data-ed-derived></div><i class="ed-compare-handle" aria-hidden="true"></i></div><label class="ed-compare-control">' + detailCopy.position + '<input type="range" min="0" max="100" value="50" step="1" data-ed-compare-range aria-label="' + detailCopy.position + '"><output>50%</output></label>' : '<p class="ed-more">' + detailCopy.noPair + '</p>') + '</div>';
  const outputs = [[text.manifestReport, data.reportPath], [text.manifestSummary, data.summaryPath], [text.manifestPoster, data.posterPath]].filter(([, path]) => path);
  const targets = ["ed-task", "ed-changes", "ed-tests", "ed-captures", "ed-outputs"];
  const empty = (kind, title, detail) => `<div class="ed-empty" data-empty-state="${kind}"><strong>${escape(title)}</strong><p>${escape(detail)}</p></div>`;
  const fileRows = gitState === "unavailable"
    ? empty("git-unavailable", text.gitUnavailableTitle, text.gitUnavailableDetail)
    : files.length ? `<ol class="ed-files">${files.map((file, index) => `<li><button type="button" data-ed-file="${index}" aria-pressed="${index === 0}" aria-controls="ed-diff-${index}"><span class="ed-index">${String(index + 1).padStart(2, "0")}</span><code>${escape(file.path)}</code><span class="ed-delta"><b>+${Number(file.additions) || 0}</b><i>−${Number(file.deletions) || 0}</i></span></button></li>`).join("")}</ol>`
      : gitState === "clean" ? empty("git-clean", text.gitCleanTitle, text.gitCleanDetail) : empty("git-details-missing", text.gitChangedMissingTitle, text.gitChangedMissingDetail);
  const testRows = tests.length ? `<ul class="ed-receipts">${tests.map((test, index) => {
    const key = test.exitCode !== 0 ? "failed" : ["passed", "failed", "skipped"].includes(test.status) ? test.status : "passed";
    const presentation = text.status[key];
    return `<li data-status="${key}"><details ${index === 0 ? "open" : ""}><summary><span class="ed-receipt-mark" aria-label="${escape(presentation.receipt)}">${presentation.symbol}</span><code>${escape(test.command)}</code><span class="ed-receipt-result">${escape(presentation.receipt)}<small>${escape(test.duration || "")} · ${escape(text.exit)} ${Number(test.exitCode) || 0}</small></span></summary><pre>${escape(test.output || copy.emptyOutput)}</pre>${test.outputTruncated ? `<p class="ed-more">${detailCopy.truncated}</p>` : ""}</details></li>`;
  }).join("")}</ul>` : empty(testState === "unconfigured" ? "tests-unconfigured" : "test-receipts-missing", testState === "unconfigured" ? text.testsUnconfiguredTitle : text.testsMissingTitle, testState === "unconfigured" ? text.testsUnconfiguredDetail : text.testsMissingDetail);
  const excluded = (data.isolatedEvidenceViewports?.length ?? 0) + (data.unclassifiedEvidenceViewports?.length ?? 0) + (data.invalidEvidenceViewports?.length ?? 0);
  const captures = screenshots.length ? `<div class="ed-captures">${screenshots.map((shot, index) => `<details ${shot.kind !== "before" || index === 0 ? "open" : ""}><summary><span>${String(index + 1).padStart(2, "0")}</span>${escape(shot.label)}</summary><figure><div class="ed-shot"><img id="ed-shot-${index}" src="data:${shot.mimeType};base64,${shot.image}" alt="${escape(shot.label)}" loading="${index === 0 ? "eager" : "lazy"}"></div><figcaption>${escape(shot.label)}<button type="button" data-ed-capture="ed-shot-${index}" title="${escape(copy.full)}">${icons.download}${escape(copy.full)}</button></figcaption></figure></details>`).join("")}</div>${excluded ? parts.integrity : ""}` : parts.integrity;
  const captureSection = `<section class="ed-section ed-visual evidence-page" id="ed-captures" aria-label="${escape(copy.capture)}"><header class="ed-section-head"><h2>${escape(copy.capture)}</h2><span>${String(screenshots.length).padStart(2, "0")} / ${String(screenshots.length + excluded).padStart(2, "0")} ${escape(data.visualProject === false && !screenshots.length ? text.captureOptionalMeta : text.captureMatched)}</span></header>${captures}${screenshots.length ? comparison : ""}</section>`;
  const statusAria = `${en ? "Status: " : "状态："}${status.badge}`;
  const settingsIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal" aria-hidden="true"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/></svg>';
  const preferences = `<details class="ed-settings"><summary aria-label="${en ? "Display settings" : "显示设置"}" title="${en ? "Display settings" : "显示设置"}">${settingsIcon}</summary><div class="ed-preferences"><h2>${en ? "Display settings" : "显示设置"}</h2>
    <fieldset><legend>${en ? "Appearance" : "明暗"}</legend><div class="ed-options"><label><input type="radio" name="ed-palette" value="light" data-ed-pref="palette" checked><span>${en ? "Light" : "亮色"}</span></label><label><input type="radio" name="ed-palette" value="dark" data-ed-pref="palette"><span>${en ? "Dark" : "暗色"}</span></label></div></fieldset>
    <fieldset><legend>${en ? "Signal color" : "信号色"}</legend><div class="ed-options"><label><input type="radio" name="ed-accent" value="yellow" data-ed-pref="accent" checked><span><i class="ed-swatch ed-swatch--yellow"></i>${en ? "Valley yellow" : "谷地黄"}</span></label><label><input type="radio" name="ed-accent" value="cyan" data-ed-pref="accent"><span><i class="ed-swatch ed-swatch--cyan"></i>${en ? "Wuling cyan" : "武陵青"}</span></label></div></fieldset>
    <label class="ed-option-row">${en ? "Full motion" : "完整动效"}<input type="checkbox" data-ed-pref="motion" checked></label>
    <label class="ed-option-row">${en ? "Moving contours" : "动态等高线"}<input type="checkbox" data-ed-pref="background" checked></label>
    <label class="ed-option-row">${en ? "Background frame cap" : "背景帧率上限"}<select data-ed-pref="fps"><option value="24">24 FPS</option><option value="60">60 FPS</option><option value="120">120 FPS</option></select></label>
    <label class="ed-option-row">${en ? "Background speed" : "背景速度"}<input type="range" min="0.5" max="2" step="0.5" value="1" data-ed-pref="speed"><output data-ed-speed-output>1x</output></label>
  </div></details>`;
  const station = `<section class="ed-station field-readout" aria-label="${escape(copy.station)}"><header><span>${escape(copy.station)}</span><small>DIJIANG / LOCAL</small></header><p class="ed-station-code">${escape(status.fieldKicker)}</p><div class="ed-verdict" role="status" aria-label="${escape(statusAria)}"><span aria-hidden="true">${escape(status.symbol)}</span><strong>${escape(status.badge)}</strong></div><p class="ed-outcome" aria-label="${escape((en ? "Status: " : "状态：") + status.deliverable)}">${escape(status.deliverable)}</p><div class="ed-metrics">${parts.metrics}</div><footer><span>${escape(copy.privacy)}</span><b>${Number(data.redactionCount) || 0} ${escape(text.redactions)}</b></footer></section>`;
  const reportMeta = `<dl class="ed-meta"><div><dt>${en ? "REVISION" : "比较范围"}</dt><dd>${escape(gitState === "unavailable" ? text.gitUnavailableMeta : data.gitRange || text.noRecords)}</dd></div><div><dt>${en ? "CAPTURED" : "报告时间"}</dt><dd>${escape(data.generatedAt || copy.untimed)}</dd></div></dl>`;
  const body = `<a class="ed-skip" href="#ed-evidence">${escape(copy.skip)}</a>
    <article class="poster dijiang-console" data-theme="frontier-signal" data-status="${status.key}">
      <header class="ed-mast"><a class="ed-brand" href="#ed-task"><b>DS</b><span>${escape(text.fieldTheme)}<small>DSH / DIJIANG</small></span></a><div class="ed-mast-meta"><span>${escape(copy.local)}</span><span>${escape(data.demo ? copy.sample : copy.snapshot)}</span>${preferences}</div></header>
      <nav class="ed-stages current-route" aria-label="${escape(copy.jump)}">${data.stages.map((stage, index) => `<a href="#${targets[index]}" ${index === 0 ? 'aria-current="location"' : ""}><b>${String(index + 1).padStart(2, "0")}</b><span>${escape(stage)}</span><i aria-hidden="true">${icons.arrow}</i></a>`).join("")}</nav>
      <div class="ed-bridge"><canvas class="ed-contours" aria-hidden="true"></canvas><div class="ed-shell">
        <header class="ed-heading" id="ed-task"><div><p class="ed-heading-code">${escape(copy.overview)} <span>// ${escape(status.fieldKicker)}</span></p><h1>${escape(data.projectName)}</h1><p class="ed-task">${escape(data.task)}</p></div>${station}</header>
      </div></div>
      <div class="ed-shell">
        <div class="ed-workspace" id="ed-evidence">
          <aside class="ed-side">
            <section class="ed-review" aria-label="${escape(copy.warnings)}"><header><h2>${escape(copy.warnings)}</h2><span>${String(warnings.length).padStart(2, "0")}</span></header>${warnings.length ? `<ul>${warnings.map((warning) => `<li>${escape(warning)}</li>`).join("")}</ul>` : `<p>${escape(copy.noWarnings)}</p>`}</section>
            ${reportMeta}
            <div class="ed-scope"><span>${escape(copy.scope)}</span><p>${escape(text.scopeGit)} · ${escape(text.scopeTests)} · ${escape(data.visualProject === false ? text.scopeScreensOptional : text.scopeScreens)}</p></div>
          </aside>
          <div class="ed-main">
            ${overview}
            <section class="route-evidence delivery-manifest ed-ledger" data-status="${status.key}" data-git-state="${escape(gitState)}" data-test-state="${escape(testState)}" data-output-state="${outputs.length ? "available" : "empty"}" aria-label="${escape(copy.archive)}">
              <div class="ed-section" id="ed-changes"><header class="ed-section-head"><h2>${escape(copy.changes)}</h2><span>${String(Number(data.fileCount) || files.length).padStart(2, "0")} ${escape(copy.count)}</span></header>${fileRows}${diffPanels}${data.fileCount > files.length ? `<p class="ed-more">${escape(copy.remaining)}</p>` : ""}</div>
              <div class="ed-section" id="ed-tests"><header class="ed-section-head"><h2>${escape(copy.checks)}</h2><span>${Number(data.passedTests) || 0} / ${Number(data.testCount) || 0}</span></header>${testRows}${data.testCount > tests.length ? `<p class="ed-more">${escape(copy.remaining)}</p>` : ""}</div>
            </section>
            ${captureSection}
            ${privacy}
            <section class="ed-section ed-outputs" id="ed-outputs"><header class="ed-section-head"><h2>${escape(copy.output)}</h2><div class="ed-export-actions"><button type="button" data-ed-download title="${escape(copy.download)}">${icons.download}${escape(copy.download)}</button><button type="button" data-ed-export="json" aria-label="${detailCopy.json}" title="${detailCopy.json}">${icons.download}JSON</button><button type="button" data-ed-export="md" aria-label="${detailCopy.markdown}" title="${detailCopy.markdown}">${icons.download}Markdown</button></div></header>${outputs.length ? `<dl>${outputs.map(([label, path]) => `<div><dt>${escape(label)}</dt><dd><code>${escape(path)}</code><button type="button" data-ed-copy="${escape(path)}" aria-label="${escape(copy.copyPath)}: ${escape(path)}" title="${escape(copy.copyPath)}">${icons.copy}</button></dd></div>`).join("")}</dl>` : empty("outputs-missing", text.outputsMissingTitle, text.outputsMissingDetail)}<p class="ed-notice" role="status" aria-live="polite"></p></section>
          </div>
        </div><footer class="ed-footer"><span>${escape(text.footer)}</span><span>DSH / ${escape(copy.archive)}</span></footer>
      </div>
    </article>`;
  return `<!doctype html><html lang="${data.locale}" data-dijiang-motion="full"><head><!--${lucideLicense}--><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(data.projectName)} · ${escape(text.fieldTheme)}</title><style>${dijiangConsoleCss}</style></head><body>${renderDijiangLoader(data.projectName, en, parts.instrument)}${body}<script id="ed-export-data" type="application/json">${exportPayload}</script><script>${dijiangMotionScript}</script><script>${dijiangConsoleScript}</script></body></html>`;
}

const dijiangConsoleScript = `(()=>{
  const root=document.documentElement;
  const links=[...document.querySelectorAll('.ed-stages a')];
  const mark=()=>{links.forEach(a=>{if(a.hash===location.hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})};
  addEventListener('hashchange',mark);if(location.hash)mark();
  const notice=document.querySelector('.ed-notice');
  const en=root.lang==='en';
  document.querySelectorAll('[data-ed-file]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-ed-file]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    document.querySelectorAll('.ed-diff-panel').forEach(panel=>panel.hidden=panel.id!==button.getAttribute('aria-controls'));
  }));
  const comparison=document.querySelector('[data-ed-comparison]');
  if(comparison){
    for(const kind of ['before','after']){
      const source=document.getElementById(comparison.dataset[kind]);
      if(source){const image=document.createElement('img');image.src=source.src;image.alt=source.alt;comparison.querySelector('.ed-compare-'+kind).append(image)}
    }
    const slider=document.querySelector('[data-ed-compare-range]');
    const update=()=>{comparison.querySelector('.ed-compare-after').style.clipPath='inset(0 0 0 '+slider.value+'%)';comparison.querySelector('.ed-compare-handle').style.left=slider.value+'%';slider.nextElementSibling.value=slider.value+'%'};
    slider.addEventListener('input',update);update();
  }
  document.querySelectorAll('[data-ed-export]').forEach(button=>button.addEventListener('click',()=>{
    const payload=JSON.parse(document.getElementById('ed-export-data').textContent);
    const json=button.dataset.edExport==='json';
    const url=URL.createObjectURL(new Blob([json?JSON.stringify(payload.report,null,2):payload.markdown],{type:json?'application/json':'text/markdown'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=(payload.report.demo?'delivery-demo-report':'delivery-report')+(json?'.json':'.md');anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }));
  document.querySelectorAll('[data-ed-copy]').forEach(button=>button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(button.dataset.edCopy);notice.textContent=en?'Copied':'已复制'}catch{notice.textContent=en?'Copy unavailable; select the path text.':'复制不可用，请选择路径文本。'}
  }));
  document.querySelectorAll('[data-ed-capture]').forEach(button=>button.addEventListener('click',()=>{
    const image=document.getElementById(button.dataset.edCapture);if(!image)return;
    const anchor=document.createElement('a');anchor.href=image.src;anchor.download=button.dataset.edCapture+'.'+(image.src.match(/^data:image\\/(png|jpeg|webp)/)?.[1]||'png');anchor.click();
  }));
  document.querySelector('[data-ed-download]')?.addEventListener('click',()=>{
    const clone=document.documentElement.cloneNode(true);clone.querySelector('.loader')?.remove();clone.dataset.loaderReady='true';clone.querySelectorAll('[data-ed-derived]').forEach(node=>node.replaceChildren());
    const url=URL.createObjectURL(new Blob(['<!doctype html>'+clone.outerHTML],{type:'text/html'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='dijiang-delivery.html';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})()`;
