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
    evidence: "响应式证据",
    captured: "个视口已采集",
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
    evidence: "RESPONSIVE EVIDENCE",
    captured: "VIEWPORTS CAPTURED",
    footer: "LOCAL ONLY / NO UPLOAD",
  };
}

function stageMarkup(stages) {
  return stages.map((stage, index) => '<span><b>' + String(index + 1).padStart(2, "0") + '</b>' + escapeHtml(stage) + '</span>').join("");
}

function evidenceMarkup(data) {
  const items = Array.isArray(data.evidenceImages) ? data.evidenceImages : [];
  if (items.length) {
    return items.map((item, index) => [
      '<figure><div class="shot"><img src="data:', item.mimeType, ';base64,', item.image, '" alt="', escapeHtml(item.label), '"></div>',
      '<figcaption><b>', String(index + 1).padStart(2, "0"), '</b><span>', escapeHtml(item.label), '</span></figcaption></figure>',
    ].join("")).join("");
  }
  return data.viewports.map((viewport, index) => [
    '<figure><div class="shot empty"><span>', escapeHtml(viewport), '</span></div>',
    '<figcaption><b>', String(index + 1).padStart(2, "0"), '</b><span>', escapeHtml(viewport), '</span></figcaption></figure>',
  ].join("")).join("");
}

function whaleSchoolMarkup() {
  const whale = [
    '<path class="whale-body" d="M15 30C23 17 42 10 61 12c16 1 28 8 34 18-5 11-18 18-34 19-19 1-36-6-46-19Z"/>',
    '<path class="whale-tail" d="M91 28c8-8 17-11 25-7-1 6-5 10-12 13 7 1 11 5 12 11-10 2-18-1-25-8Z"/>',
    '<path class="whale-fin" d="M49 41c8 1 14 6 18 12-9 2-16-1-21-7Z"/>',
    '<circle class="whale-eye" cx="35" cy="27" r="1.8"/>',
    '<path class="whale-spout" d="M54 10c-1-5 2-8 6-10m-5 10c4-4 8-4 11-2"/>',
  ].join("");
  return [
    '<div class="whale-school" aria-hidden="true">',
    '<svg class="whale whale-one" viewBox="0 0 122 56">', whale, '</svg>',
    '<svg class="whale whale-two" viewBox="0 0 122 56">', whale, '</svg>',
    '<svg class="whale whale-three" viewBox="0 0 122 56">', whale, '</svg>',
    '</div>',
  ].join("");
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
    "body{background:#dcecff;color:#10245c}.poster{background:#eff7ff;box-shadow:inset 0 0 0 .24vw #0a5fd2}",
    ".current{position:absolute;z-index:0;left:-14%;width:112%;height:24%;clip-path:polygon(0 27%,92% 0,100% 71%,7% 100%);animation:current-drift 16s cubic-bezier(.22,1,.36,1) infinite alternate}.current-one{top:-7%;background:#d2e8ff}.current-two{top:27%;left:-19%;background:#c2e2ff;animation-duration:21s;animation-direction:alternate-reverse}.current-three{bottom:-7%;left:-8%;background:#dcedff;animation-duration:18s}.ripple{position:absolute;z-index:0;border:.12vw solid #71c4e8;border-radius:50%;animation:ripple-spin 28s linear infinite}.ripple-one{top:-32%;left:28%;width:39vw;height:39vw}.ripple-two{right:-4%;bottom:-31%;width:30vw;height:30vw;border-color:#9bd9ef;animation-direction:reverse;animation-duration:34s}",
    ".portrait-wash{position:absolute;z-index:1;top:-7%;right:-1%;width:45%;height:112%;pointer-events:none;opacity:.2;mix-blend-mode:multiply;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 31%,#000 100%);mask-image:linear-gradient(90deg,transparent 0,#000 31%,#000 100%);animation:portrait-tide 10s cubic-bezier(.22,1,.36,1) infinite alternate}.art{width:100%;height:100%;object-fit:contain;object-position:right center;filter:saturate(.9) contrast(1.04)}.whale-school{position:absolute;z-index:2;inset:0;pointer-events:none}.whale{position:absolute;overflow:visible;color:#0a5fd2;filter:drop-shadow(.18vw .2vw 0 rgba(255,255,255,.7));animation:whale-drift 13s cubic-bezier(.22,1,.36,1) infinite alternate}.whale-body,.whale-tail,.whale-fin{fill:currentColor}.whale-eye{fill:#fff}.whale-spout{fill:none;stroke:#48bfe9;stroke-width:2.2;stroke-linecap:round}.whale-one{top:12%;right:27%;width:8.2vw;opacity:.38;transform:rotate(-5deg)}.whale-two{top:42%;right:4%;width:5.6vw;color:#38b9c8;opacity:.32;animation-delay:-5s;animation-duration:17s;transform:rotate(4deg)}.whale-three{right:15%;bottom:7%;width:9.8vw;opacity:.2;animation-delay:-8s;animation-duration:21s;transform:rotate(-3deg)}.spark{position:absolute;z-index:3;width:1.1vw;height:1.1vw;background:#ffd24a;clip-path:polygon(50% 0,62% 37%,100% 50%,62% 63%,50% 100%,38% 63%,0 50%,38% 37%);animation:sparkle 4.2s ease-in-out infinite}.s1{top:11%;right:5%}.s2{top:55%;right:2%;animation-delay:-1.7s}.s3{bottom:8%;right:29%;animation-delay:-3s}",
    ".copy{position:absolute;z-index:5;top:9.5%;left:6.25%;width:70%}.kicker{display:inline-block;padding:.55vw .8vw;color:#10245c;background:#ffd24a;font-size:.95vw;font-weight:900;transform:rotate(-1deg)}.title{margin:1.15vw 0 .6vw;color:#0757cf;font:900 4.3vw/.9 'Bahnschrift Condensed','Arial Narrow','Microsoft YaHei UI',sans-serif}.task{max-width:57vw;margin:0;color:#152a61;font-size:1.45vw;line-height:1.45;font-weight:800}.verified{display:inline-block;margin-top:1.3vw;padding:.62vw .9vw;color:#10245c;background:#fff;border:.18vw solid #10245c;box-shadow:.42vw .42vw 0 #ffd24a;font-size:1vw;font-weight:900}",
    ".pop{position:absolute;z-index:7;top:7%;right:3.5%;padding:.68vw .9vw;color:#10245c;background:#ffd24a;box-shadow:.35vw .35vw 0 #0b6ca0;font-size:1.05vw;font-weight:900;transform:rotate(3deg)}",
    ".rail{position:absolute;z-index:6;left:6.25%;top:36.8%;width:72%;display:flex;gap:.35vw;overflow:hidden}.rail:after{content:'';position:absolute;z-index:2;top:0;bottom:0;left:-12%;width:7%;background:#48bfe9;transform:skewX(-12deg);animation:rail-flow 7s linear infinite;pointer-events:none}.rail span{position:relative;z-index:1;flex:1;min-width:0;padding:1.25vh .75vw;color:#fff;background:#0757cf;font-size:.95vw;font-weight:900;clip-path:polygon(0 0,94% 0,100% 100%,6% 100%)}.rail span:last-child{color:#10245c;background:#ffd24a;animation:current-stage 3.4s ease-in-out infinite}.rail b{display:block;margin-bottom:.45vh;color:#a9d7ff;font:.67vw 'Cascadia Mono',monospace}.rail span:last-child b{color:#6b5900}",
    ".metrics{position:absolute;z-index:6;left:6.25%;top:47.8%;width:72%;display:grid;grid-template-columns:repeat(3,1fr);gap:.7vw}.metric{padding:1vw;background:#fff;border:.16vw solid #0757cf}.metric:nth-child(2){background:#e4f0ff}.metric:nth-child(3){background:#ffd24a}.metric b{display:block;color:#10245c;font:900 2vw 'Cascadia Mono',monospace}.metric small{color:#1b3470;font-size:.75vw;font-weight:900}",
    ".evidence-board{position:absolute;z-index:6;left:6.25%;top:59%;width:72%;height:25%;overflow:hidden;padding:.8vw;background:#0757cf;border:1px solid #064caf}.evidence-head{display:flex;align-items:end;justify-content:space-between;padding-bottom:.7vh;border-bottom:1px solid #65b8ef}.evidence-head b{color:#fff;font-size:.95vw}.evidence-head span{color:#ffd24a;font:.72vw 'Cascadia Mono',monospace}.evidence-grid{position:relative;height:calc(100% - 3.2vh);display:grid;grid-template-columns:1.55fr 1fr .72fr;gap:.7vw;align-items:end;padding-top:1vh}.evidence-grid figure{min-width:0;margin:0}.evidence-grid figure:nth-child(1){height:100%}.evidence-grid figure:nth-child(2){height:88%}.evidence-grid figure:nth-child(3){height:78%}.shot{height:calc(100% - 2.6vh);overflow:hidden;border:1px solid #d8edff;background:#eef7ff}.shot img{display:block;width:100%;height:100%;object-fit:cover}.evidence-grid figure:nth-child(1) img{object-position:center 100%}.evidence-grid figure:nth-child(2) img{object-position:center 70%}.evidence-grid figure:nth-child(3) img{object-position:center 55%}.shot.empty{display:grid;place-items:center;color:#d8edff;background:#0b62ce;font:.7vw 'Cascadia Mono',monospace}.evidence-grid figcaption{display:flex;justify-content:space-between;gap:.5vw;padding-top:.5vh;color:#e6f3ff;font:.62vw 'Cascadia Mono',monospace}.evidence-grid figcaption b{color:#ffd24a}.evidence-grid figcaption span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.evidence-board:after{content:'';position:absolute;z-index:4;left:-12%;top:3.5vh;width:7%;height:calc(100% - 3.5vh);border-right:1px solid #bfe8ff;background:#48bfe9;opacity:.24;transform:skewX(-10deg);animation:evidence-scan 8s linear infinite;pointer-events:none}",
    ".footer{position:absolute;z-index:8;left:6.25%;bottom:4.5%;color:#0757cf;font:900 .72vw 'Cascadia Mono',monospace;letter-spacing:.08em}",
    "@keyframes current-drift{to{transform:translate3d(7vw,1.2vh,0) scale(1.03)}}@keyframes ripple-spin{to{transform:rotate(360deg)}}@keyframes portrait-tide{to{transform:translate3d(1.5vw,-.8vh,0) scale(1.015);opacity:.24}}@keyframes whale-drift{to{translate:2.4vw -1.1vh;rotate:2deg}}@keyframes sparkle{50%{transform:scale(1.35) rotate(45deg);opacity:.55}}@keyframes rail-flow{to{transform:translateX(86vw) skewX(-12deg)}}@keyframes current-stage{50%{transform:translateY(-3px)}}@keyframes evidence-scan{to{transform:translateX(78vw) skewX(-10deg)}}@keyframes reduced-tide{50%{opacity:.72}}@keyframes reduced-portrait{50%{opacity:.14}}@keyframes reduced-pulse{50%{opacity:.45}}@media(prefers-reduced-motion:reduce){.current{animation:reduced-tide 8s ease-in-out infinite!important}.portrait-wash{animation:reduced-portrait 8s ease-in-out infinite!important}.spark,.whale,.rail span:last-child{animation:reduced-pulse 5s ease-in-out infinite!important}.ripple,.rail:after,.evidence-board:after{animation:none!important}}",
  ].join("");
  return [
    '<!doctype html><html lang="', data.locale, '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>', escapeHtml(text.title), '</title><style>', sharedCss, css, '</style></head><body>',
    '<article class="poster" data-theme="blue-big-fish"><div class="current current-one"></div><div class="current current-two"></div><div class="current current-three"></div><div class="ripple ripple-one"></div><div class="ripple ripple-two"></div><div class="portrait-wash"><img class="art" src="data:image/webp;base64,', data.image, '" alt=""></div>', whaleSchoolMarkup(), '<i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i>',
    '<div class="copy"><div class="kicker">', escapeHtml(text.fishTheme), ' / ', escapeHtml(text.fishKicker), '</div><h1 class="title">', escapeHtml(data.projectName), '</h1><p class="task">', escapeHtml(data.task), '</p><div class="verified">✓ ', escapeHtml(text.verifiedAll), '</div></div>',
    '<div class="pop">', escapeHtml(text.done), '</div>',
    '<div class="rail">', stageMarkup(data.stages), '</div>',
    '<div class="metrics"><div class="metric"><b>', data.fileCount, '</b><small>', escapeHtml(text.files), '</small></div><div class="metric"><b>', data.passedTests, '/', data.testCount, '</b><small>', escapeHtml(text.tests), '</small></div><div class="metric"><b>', data.redactionCount, '</b><small>', escapeHtml(text.redactions), '</small></div></div>',
    '<div class="evidence-board"><div class="evidence-head"><b>', escapeHtml(text.evidence), '</b><span>', String(data.evidenceImages?.length || data.viewports.length).padStart(2, "0"), ' ', escapeHtml(text.captured), '</span></div><div class="evidence-grid">', evidenceMarkup(data), '</div></div>',
    '<div class="footer mono">', escapeHtml(text.footer), '</div></article></body></html>',
  ].join("");
}

export function createStyledPosterHtml(data) {
  return data.theme === "blue-big-fish" ? createFishPoster(data) : createFieldPoster(data);
}
