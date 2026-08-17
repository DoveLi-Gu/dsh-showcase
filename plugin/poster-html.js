function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function posterText(locale) {
  return locale === "zh-CN" ? {
    title: "布局证据海报",
    fieldTheme: "边境信号",
    fishTheme: "蓝色大肥鱼",
    fieldKicker: "任务完成 / 交付通告",
    fishKicker: "证据新鲜出炉",
    verified: "已验证",
    verifiedAll: "全部验证完成",
    deliverable: "可交付",
    done: "交付完成!",
    local: "本地生成",
    files: "改动文件",
    tests: "通过测试",
    redactions: "已脱敏",
    footer: "仅在本地生成 / 不会上传",
  } : {
    title: "Layout evidence poster",
    fieldTheme: "Frontier Signal",
    fishTheme: "Blue Big Fish",
    fieldKicker: "TASK COMPLETE / DELIVERY NOTICE",
    fishKicker: "FRESH DELIVERY EVIDENCE",
    verified: "VERIFIED",
    verifiedAll: "VERIFIED / ALL CHECKS PASSED",
    deliverable: "READY",
    done: "DELIVERED!",
    local: "LOCAL ONLY",
    files: "FILES",
    tests: "TESTS",
    redactions: "REDACTED",
    footer: "LOCAL ONLY / NO UPLOAD",
  };
}

function stageMarkup(stages) {
  return stages.map((stage, index) => '<span><b>' + String(index + 1).padStart(2, "0") + '</b>' + escapeHtml(stage) + '</span>').join("");
}

const sharedCss = [
  "*{box-sizing:border-box}",
  "html,body{width:100%;height:100%;overflow:hidden}",
  "body{margin:0;font-family:'Bahnschrift','Microsoft YaHei UI','Noto Sans SC',sans-serif}",
  ".poster{position:relative;width:100vw;height:100vh;overflow:hidden}",
  ".mono{font-family:'Cascadia Mono','Microsoft YaHei UI',monospace}",
  "@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important}}",
].join("");

function createFieldPoster(data) {
  const text = posterText(data.locale);
  const css = [
    "body{background:#e9ece7;color:#101310}.poster{background:#eff1ec}",
    ".photo{position:absolute;inset:-6% 23% -6% 35%;background-image:url('data:image/webp;base64,", data.image, "');background-position:center 48%;background-size:cover;filter:grayscale(1) contrast(1.2) brightness(1.06);clip-path:polygon(18% 0,100% 0,77% 100%,0 100%);animation:photo 13s ease-in-out infinite alternate}",
    ".slash{position:absolute;inset:-16% 24% -16% 29%;background:#d7ef2f;clip-path:polygon(66% 0,100% 0,61% 100%,0 100%);mix-blend-mode:multiply;opacity:.88}",
    ".scan{position:absolute;z-index:2;inset:0 auto 0 -18%;width:13%;background:rgba(215,239,47,.28);transform:skewX(-16deg);animation:scan 8.5s linear infinite}",
    ".mast{position:absolute;z-index:4;top:5.4%;left:4.6%;right:4.6%;display:flex;justify-content:space-between;padding-top:1.3%;border-top:8px solid #111410;font:900 1vw monospace}",
    ".ghost{position:absolute;right:-1%;top:9%;font:900 16vw/.74 Impact,'Microsoft YaHei UI',sans-serif;writing-mode:vertical-rl;opacity:.075}",
    ".copy{position:absolute;z-index:5;top:21%;left:5.2%;width:48%}.kicker{display:inline-block;padding:.7vw 1vw;color:#fff;background:#111410;font:900 1vw monospace}.title{max-width:45vw;margin:1.5vw 0 1vw;font:900 5.4vw/.86 Impact,'Arial Narrow','Microsoft YaHei UI',sans-serif}.task{max-width:41vw;margin:0;font-size:1.8vw;line-height:1.4;font-weight:800}.verified{display:inline-block;margin-top:1.5vw;padding:.8vw 1.1vw;background:#d7ef2f;font-weight:900}",
    ".stamp{position:absolute;z-index:7;top:19%;right:5.2%;padding:.7vw 1vw;color:#ed4035;border:.35vw solid #ed4035;font-size:1.7vw;font-weight:900;transform:rotate(-4deg)}",
    ".metrics{position:absolute;z-index:6;right:5.2%;bottom:18.8%;width:30%;display:grid;grid-template-columns:repeat(3,1fr);gap:1vw;padding:1.4vw 1.5vw;color:#fff;background:#111410}.metrics b{display:block;font:900 2.2vw monospace}.metrics small{font-size:.82vw;font-weight:800}",
    ".rail{position:absolute;z-index:7;left:5.2%;right:5.2%;bottom:7%;display:grid;grid-template-columns:repeat(5,1fr);color:#fff;background:#111410}.rail:after{content:'';position:absolute;inset:0;width:18%;background:rgba(215,239,47,.22);animation:flow 7s linear infinite}.rail span{position:relative;z-index:1;min-height:7vh;padding:1.1vh 1vw;border-right:1px solid #606761;font-weight:900}.rail span:last-child{color:#111410;background:#d7ef2f}.rail b{display:block;margin-bottom:.5vh;color:#aeb7b0;font:.75vw monospace}.rail span:last-child b{color:#596400}",
    ".footer{position:absolute;z-index:7;left:5.2%;bottom:2.2%;font:800 .75vw monospace}",
    "@keyframes photo{to{transform:translate(10px,-5px) scale(1.025)}}@keyframes scan{to{transform:translateX(120vw) skewX(-16deg)}}@keyframes flow{from{transform:translateX(-120%)}to{transform:translateX(620%)}}",
  ].join("");
  return [
    '<!doctype html><html lang="', data.locale, '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>', escapeHtml(text.title), '</title><style>', sharedCss, css, '</style></head><body>',
    '<article class="poster" data-theme="frontier-signal"><div class="photo"></div><div class="slash"></div><div class="scan"></div>',
    '<div class="mast"><span>DSH / ', escapeHtml(text.title), '</span><span>0017 / ', escapeHtml(text.local), '</span></div><div class="ghost">', escapeHtml(text.deliverable), '</div>',
    '<div class="copy"><div class="kicker">', escapeHtml(text.fieldTheme), ' / ', escapeHtml(text.fieldKicker), '</div><h1 class="title">', escapeHtml(data.projectName), '</h1><p class="task">', escapeHtml(data.task), '</p><div class="verified">✓ ', escapeHtml(text.verified), '</div></div>',
    '<div class="stamp">', escapeHtml(text.deliverable), '</div><div class="metrics"><div><b>', data.fileCount, '</b><small>', escapeHtml(text.files), '</small></div><div><b>', data.passedTests, '/', data.testCount, '</b><small>', escapeHtml(text.tests), '</small></div><div><b>', data.redactionCount, '</b><small>', escapeHtml(text.redactions), '</small></div></div>',
    '<div class="rail">', stageMarkup(data.stages), '</div><div class="footer mono">', data.viewports.map(escapeHtml).join(" / "), ' / ', escapeHtml(text.footer), '</div></article></body></html>',
  ].join("");
}

function createFishPoster(data) {
  const text = posterText(data.locale);
  const css = [
    "body{background:#f3f7ff;color:#10245c}.poster{background:#fff;border:.28vw solid #0757cf}",
    ".art{position:absolute;z-index:1;top:0;right:-2%;bottom:auto;width:66%;height:112%;object-fit:contain;object-position:right bottom;animation:float 8.2s ease-in-out infinite}",
    ".cover{position:absolute;z-index:2;inset:0 36% 0 0;background:#fff;clip-path:polygon(0 0,100% 0,84% 100%,0 100%)}",
    ".arc{position:absolute;z-index:0;border:.28vw solid #1767e8;border-left-color:transparent;border-bottom-color:transparent;border-radius:50%;animation:spin 22s linear infinite}.a1{top:11%;right:7%;width:42%;aspect-ratio:1}.a2{top:4%;right:-8%;width:54%;aspect-ratio:1;border-width:.13vw;opacity:.65;animation-direction:reverse;animation-duration:29s}",
    ".copy{position:absolute;z-index:5;top:10%;left:5.4%;width:52%}.kicker{display:inline-block;padding:.7vw 1vw;background:#ffd24a;font-size:1.05vw;font-weight:900;transform:rotate(-1deg)}.title{margin:1.5vw 0 1vw;color:#0757cf;font:900 5.9vw/.78 Impact,'Arial Narrow','Microsoft YaHei UI',sans-serif}.title span{display:block}.task{max-width:39vw;margin:0;color:#172d66;font-size:1.7vw;line-height:1.42;font-weight:800}.verified{display:inline-block;margin-top:1.5vw;padding:.75vw 1vw;border:.28vw solid #10245c;background:#fff;box-shadow:.55vw .55vw 0 #ffd24a;font-weight:900;transform:rotate(1deg)}",
    ".pop{position:absolute;z-index:7;padding:.75vw 1vw;color:#fff;background:#0757cf;box-shadow:.42vw .42vw 0 #ffd24a;font-size:1.25vw;font-weight:900}.p1{top:8%;right:4.3%;transform:rotate(4deg)}.p2{right:45%;bottom:23%;transform:rotate(-3deg)}",
    ".metrics{position:absolute;z-index:7;left:5.4%;bottom:18.2%;display:flex;gap:.85vw}.metric{min-width:9vw;padding:.8vw .95vw;background:#fff;border:.28vw solid #0757cf;transform:rotate(-2deg)}.metric:nth-child(2){background:#e8f1ff;transform:rotate(2deg)}.metric:nth-child(3){background:#ffd24a;transform:rotate(-1deg)}.metric b{display:block;font:900 2.1vw monospace}.metric small{font-size:.75vw;font-weight:900}",
    ".rail{position:absolute;z-index:8;left:4.6%;right:4.6%;bottom:6.5%;display:flex;gap:.4vw}.rail span{flex:1;padding:1vh 1vw;color:#fff;background:#0757cf;font-weight:900;clip-path:polygon(0 0,94% 0,100% 100%,6% 100%)}.rail span:last-child{color:#10245c;background:#ffd24a;animation:current 3.4s ease-in-out infinite}.rail b{display:block;font:.72vw monospace;opacity:.76}.footer{position:absolute;z-index:8;right:4.8%;bottom:1.8%;color:#0757cf;font:800 .72vw monospace}",
    "@keyframes float{50%{transform:translateY(-8px) rotate(.3deg)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes current{50%{transform:translateY(-3px)}}",
  ].join("");
  return [
    '<!doctype html><html lang="', data.locale, '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>', escapeHtml(text.title), '</title><style>', sharedCss, css, '</style></head><body>',
    '<article class="poster" data-theme="blue-big-fish"><div class="arc a1"></div><div class="arc a2"></div><img class="art" src="data:image/webp;base64,', data.image, '" alt=""><div class="cover"></div>',
    '<div class="copy"><div class="kicker">', escapeHtml(text.fishTheme), ' / ', escapeHtml(text.fishKicker), '</div><h1 class="title"><span>dsh</span><span>showcase</span></h1><p class="task">', escapeHtml(data.task), '</p><div class="verified">✓ ', escapeHtml(text.verifiedAll), '</div></div>',
    '<div class="pop p1">', escapeHtml(text.done), '</div><div class="pop p2">', escapeHtml(text.local), '</div>',
    '<div class="metrics"><div class="metric"><b>', data.fileCount, '</b><small>', escapeHtml(text.files), '</small></div><div class="metric"><b>', data.passedTests, '/', data.testCount, '</b><small>', escapeHtml(text.tests), '</small></div><div class="metric"><b>', data.redactionCount, '</b><small>', escapeHtml(text.redactions), '</small></div></div>',
    '<div class="rail">', stageMarkup(data.stages), '</div><div class="footer mono">', data.viewports.map(escapeHtml).join(" / "), '</div></article></body></html>',
  ].join("");
}

export function createStyledPosterHtml(data) {
  return data.theme === "blue-big-fish" ? createFishPoster(data) : createFieldPoster(data);
}
