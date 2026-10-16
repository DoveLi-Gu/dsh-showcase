export const dijiangConsoleCss = `
:root{color-scheme:light;--paper:#fff;--ink:#191919;--muted:#666;--line:#d9d9d9;--surface:#f2f2f2;--inset:#e6e6e6;--signal:#fffa00;--contour:#191919;--positive:#191919;--negative:#666;--mono:'Cascadia Mono',Consolas,'PingFang SC','Microsoft YaHei',monospace;--space-xs:4px;--space-sm:8px;--space-md:16px;--space-lg:24px;--space-xl:32px;--topbar:64px;--rail:80px}
:root[data-ed-palette=dark]{color-scheme:dark;--paper:#191919;--ink:#fff;--muted:#b3b3b3;--line:#424242;--surface:#252525;--inset:#353535;--contour:#fff;--positive:#fff;--negative:#b3b3b3}
:root[data-ed-accent=cyan]{--signal:#14d0d0}
*{box-sizing:border-box;min-width:0;letter-spacing:0}html{font-size:16px;scroll-behavior:smooth;scroll-padding-top:88px}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,'Helvetica Neue','PingFang SC','Microsoft YaHei',sans-serif;font-variant-numeric:tabular-nums;line-height:1.5}button,input,select{font:inherit}button,a,summary{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button,a,summary,input,select{border-radius:0}button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--ink);outline-offset:4px}a{color:inherit}button{color:inherit}svg{display:block}.lucide{flex:0 0 auto}button{display:inline-flex;align-items:center;justify-content:center;gap:8px}button:active{transform:translateX(1px)}button:hover{background:var(--inset)}[hidden]{display:none!important}
.poster.dijiang-console{width:100%;height:auto;min-height:100svh;padding:var(--topbar) 0 0 var(--rail);background:var(--paper);color:var(--ink);overflow:visible}.ed-shell{width:100%;max-width:1440px;padding:0 56px;margin:auto}.ed-skip{position:fixed;top:-80px;left:16px;z-index:60;background:var(--signal);color:#191919;padding:12px 16px}.ed-skip:focus{top:8px}
.ed-mast{position:fixed;z-index:30;inset:0 0 auto;height:var(--topbar);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 24px;background:var(--paper);border-bottom:1px solid var(--line)}.ed-brand{display:flex;align-items:center;gap:16px;text-decoration:none}.ed-brand>b{display:grid;place-items:center;width:40px;height:40px;background:var(--ink);color:var(--paper);font-size:20px;font-weight:900}.ed-brand>span{font-size:14px;font-weight:700}.ed-brand small{display:block;font:10px/1.6 var(--mono);color:var(--muted)}.ed-mast-meta{display:flex;align-items:center;gap:24px;font:11px var(--mono)}.ed-mast-meta>span:last-of-type{border:1px solid var(--line);padding:4px 8px}.ed-settings{position:relative}.ed-settings>summary{width:40px;height:40px;display:grid;place-items:center;cursor:pointer;list-style:none;border:1px solid var(--line)}.ed-settings summary::-webkit-details-marker{display:none}.ed-settings[open]>summary{background:var(--signal);color:#191919;border-color:#191919}.ed-preferences{position:absolute;z-index:40;right:0;top:48px;width:288px;max-width:calc(100vw - 32px);padding:20px;background:var(--paper);border:1px solid var(--ink);box-shadow:6px 6px 0 color-mix(in srgb,var(--ink) 12%,transparent)}.ed-preferences h2{font-size:16px;margin:0 0 16px}.ed-preferences fieldset{border:0;margin:0 0 16px;padding:0}.ed-preferences legend{font-size:12px;margin-bottom:8px;color:var(--muted)}.ed-options{display:flex;gap:0}.ed-options label{flex:1;position:relative}.ed-options input{position:absolute;opacity:0;width:1px;height:1px}.ed-options span{min-height:40px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);font-size:12px;cursor:pointer}.ed-options input:checked+span{background:var(--ink);color:var(--paper);border-color:var(--ink)}.ed-options input:focus-visible+span{outline:2px solid var(--ink);outline-offset:3px}.ed-swatch{display:block;width:12px;height:12px;border:1px solid #191919}.ed-swatch--yellow{background:#fffa00}.ed-swatch--cyan{background:#14d0d0}.ed-option-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;margin-bottom:12px}.ed-option-row input[type=checkbox]{width:18px;height:18px;accent-color:var(--ink)}.ed-option-row select{background:var(--surface);color:var(--ink);border:1px solid var(--line);min-height:36px;padding:4px 8px}.ed-option-row input[type=range]{width:128px;accent-color:var(--ink)}.ed-option-row output{width:3ch;text-align:right}.ed-preferences :disabled{opacity:.45;cursor:not-allowed}
.ed-preferences{max-height:calc(100svh - var(--topbar) - 88px);overflow:auto;overscroll-behavior:contain}
.ed-stages.current-route{position:fixed;z-index:20;inset:var(--topbar) auto 0 0;width:var(--rail);display:flex;flex-direction:column;gap:0;padding:16px 0;background:var(--paper);border-right:1px solid var(--line);overflow-y:auto}.ed-stages a{min-height:72px;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-decoration:none;border-left:4px solid transparent;border-bottom:0;transition:background .15s,color .15s}.ed-stages b{font:18px var(--mono)}.ed-stages span{font-size:12px;font-weight:700;overflow-wrap:anywhere}.ed-stages i{display:none}.ed-stages a[aria-current]{background:var(--inset);color:var(--ink);border-left-color:var(--ink)}.ed-stages a:hover{background:var(--surface);color:var(--ink)}.ed-stages:after{content:'DSH / DIJIANG';writing-mode:vertical-rl;margin:24px auto 0;font:10px var(--mono);color:var(--muted)}
.ed-bridge{position:relative;isolation:isolate;background:var(--surface);border-bottom:1px solid var(--line);overflow:hidden}.ed-bridge:before{content:'';position:absolute;z-index:-1;inset:0 0 0 45%;background-image:radial-gradient(var(--muted) .65px,transparent .65px);background-size:12px 12px;opacity:.14;pointer-events:none}.ed-contours{position:absolute;inset:0 0 0 auto;width:58%;height:100%;z-index:-1;pointer-events:none;opacity:.14;mask-image:linear-gradient(90deg,transparent,#000 30%)}.ed-heading{display:grid;grid-template-columns:minmax(0,1fr) 288px;gap:64px;align-items:center;padding:56px 0 64px}.ed-heading-code{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:0 0 28px;font-size:12px;font-weight:700}.ed-heading-code>span{font-size:11px;font-weight:400;color:var(--muted)}.ed-heading-code:before{content:'';width:24px;height:12px;background:var(--signal);border-left:4px solid var(--ink);transform:skewX(-18deg)}.ed-heading h1{max-width:26ch;font-size:64px;line-height:1.04;font-weight:900;overflow-wrap:anywhere;margin:0 0 24px;text-wrap:balance}.ed-task{font-size:15px;line-height:1.8;margin:0;max-width:70ch;overflow-wrap:anywhere}.ed-station{--ink:#fff;--paper:#191919;--muted:#b3b3b3;--line:#424242;border:1px solid var(--line);border-top:3px solid var(--signal);padding:24px;background:var(--paper);color:var(--ink)}.ed-station>header{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:700}.ed-station small{font:9px var(--mono);color:var(--muted)}.ed-station-code,.ed-outcome{display:none}.ed-verdict{display:flex;gap:12px;align-items:center;margin:24px 0}.ed-verdict>span{display:grid;place-items:center;min-width:24px;height:32px;background:var(--signal);color:#191919;font-size:20px;font-weight:700}.ed-verdict strong{font-size:30px;line-height:1.2;overflow-wrap:anywhere}.ed-metrics{display:grid;grid-template-columns:1fr 1fr;gap:24px}.ed-metrics>div{display:flex;flex-direction:column;align-items:start;border-top:1px solid var(--line);padding:16px 0;gap:6px}.ed-metrics small{font:11px Arial,'Microsoft YaHei',sans-serif;color:var(--muted)}.ed-metrics b{font:24px var(--mono);order:2;overflow-wrap:anywhere}.ed-metrics>div:last-child{display:none}.ed-station footer{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--line);padding-top:12px;font-size:10px}.ed-station footer b{font-weight:400}.dijiang-console[data-status=failed] .ed-verdict>span{background:var(--signal);color:#191919;border:1px solid var(--ink)}
.ed-workspace{padding:0 0 24px;display:flex;flex-direction:column}.ed-side{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,.8fr);gap:24px;padding:20px 0;border-bottom:1px solid var(--line);margin-bottom:24px}.ed-review header{display:flex;align-items:center;justify-content:space-between;gap:8px}.ed-review h2{font-size:12px;margin:0}.ed-review header>span{font:11px var(--mono)}.ed-review ul{margin:8px 0 0;padding-left:16px}.ed-review p,.ed-review li{font-size:11px;line-height:1.7;color:var(--muted);overflow-wrap:anywhere}.ed-review p{margin:8px 0 0}.ed-meta{display:grid;gap:8px;margin:0;padding-left:24px;border-left:1px solid var(--line);font-size:10px}.ed-meta dt{color:var(--muted)}.ed-meta dd{margin:4px 0 0;font:11px/1.5 var(--mono);overflow-wrap:anywhere}.ed-scope{border-left:1px solid var(--line);padding-left:24px;font-size:11px;color:var(--muted)}.ed-scope p{line-height:1.7;margin:8px 0 0}.ed-main{width:100%}.ed-section{margin:0 0 32px;scroll-margin-top:24px}.ed-section-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--ink);padding:0 0 12px;margin:0}.ed-section-head h2{display:flex;align-items:center;gap:10px;font-size:16px;line-height:1.3;margin:0;font-weight:700}.ed-section-head h2:before{content:'';width:4px;height:14px;flex:0 0 4px;background:var(--ink)}.ed-section-head>span{font:11px var(--mono);color:var(--muted);text-align:right}.ed-overview dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;border-bottom:1px solid var(--line)}.ed-overview dl>div{padding:16px 24px;border-right:1px solid var(--line)}.ed-overview dl>div:first-child{padding-left:0}.ed-overview dl>div:last-child{border-right:0}.ed-overview dt{font-size:11px;color:var(--muted)}.ed-overview dd{font:22px/1.4 var(--mono);margin:8px 0 0;overflow-wrap:anywhere}.ed-overview .ed-delta{font-size:22px}.ed-delta{display:flex;flex-wrap:wrap;gap:8px;font:12px var(--mono)}.ed-delta b{font-weight:600;color:var(--positive)}.ed-delta i{font-style:normal;color:var(--negative)}
.ed-ledger.delivery-manifest{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:32px;position:static;background:none;border:0;padding:0;margin:0;overflow:visible}.ed-files,.ed-receipts{list-style:none;padding:0;margin:0}.ed-files li{border-bottom:1px solid var(--line)}.ed-files button{display:grid;grid-template-columns:24px minmax(0,1fr) auto;align-items:baseline;gap:8px;width:100%;padding:12px 8px;text-align:left;border:0;background:none}.ed-files button[aria-pressed=true]{background:var(--inset);box-shadow:inset 3px 0 var(--signal)}.ed-files button:hover{background:var(--surface)}.ed-index{font:10px var(--mono);color:var(--muted)}.ed-files code,.ed-receipts code{font:12px/1.6 var(--mono);overflow-wrap:anywhere}.ed-diff-panel{margin-top:16px}.ed-diff-panel header{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:12px;background:var(--ink);color:var(--paper)}.ed-diff-panel h3{font-size:12px;margin:0}.ed-diff-panel header code{font:10px var(--mono);overflow-wrap:anywhere}.ed-diff-code{margin:0;padding:12px;background:var(--surface);border:1px solid var(--line);border-top:0;color:var(--ink);max-height:256px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 var(--mono)}.ed-diff-line{font:inherit}.ed-diff-line.addition{color:var(--positive)}.ed-diff-line.deletion{color:var(--negative)}.ed-diff-line.hunk{color:var(--ink);background:color-mix(in srgb,var(--signal) 32%,var(--paper))}.ed-diff-missing{margin:0;padding:16px;background:var(--inset);color:var(--muted);font-size:12px}.ed-more{font-size:11px;color:var(--muted);margin:8px 0;overflow-wrap:anywhere}.ed-receipts>li{border-bottom:1px solid var(--line)}.ed-receipts summary{display:grid;grid-template-columns:16px minmax(0,1fr) auto 12px;gap:8px;align-items:center;padding:12px 8px;cursor:pointer;list-style:none}.ed-receipts summary::-webkit-details-marker{display:none}.ed-receipts summary:after{content:'+';font:16px var(--mono)}.ed-receipts details[open]>summary:after{content:'−'}.ed-receipts summary:hover,.ed-receipts details[open]>summary{background:var(--inset)}.ed-receipt-mark{font-size:16px}.ed-receipt-result{font-size:11px;text-align:right}.ed-receipt-result small{display:block;font:9px/1.7 var(--mono);color:var(--muted)}.ed-receipts [data-status=failed] .ed-receipt-result,.ed-receipts [data-status=failed] .ed-receipt-mark{color:var(--negative)}.ed-receipts pre{background:var(--surface);color:var(--ink);margin:0;padding:16px;max-height:240px;overflow:auto;font:12px/1.8 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere}.ed-empty{padding:24px 0}.ed-empty strong{font-size:13px}.ed-empty p{font-size:12px;line-height:1.7;color:var(--muted);max-width:65ch;margin:8px 0 0}
.ed-visual.evidence-page{position:relative;background:none;min-height:0;overflow:visible;padding:0}.ed-captures{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.ed-captures details{align-self:start;border-bottom:1px solid var(--line)}.ed-captures summary{display:flex;align-items:baseline;gap:12px;padding:12px 0;font-size:12px;cursor:pointer;list-style:none;overflow-wrap:anywhere}.ed-captures summary::-webkit-details-marker{display:none}.ed-captures summary>span{font:10px var(--mono);color:var(--muted)}.ed-captures summary:after{content:'+';margin-left:auto}.ed-captures details[open]>summary:after{content:'−'}.ed-captures figure{margin:0}.ed-captures .ed-shot{display:block;height:240px;background:var(--inset);overflow:auto;border:1px solid var(--line)}.ed-captures img{display:block;width:100%;height:100%;object-fit:contain}.ed-captures figcaption{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin:8px 0;font-size:10px;color:var(--muted)}.ed-captures button,.ed-outputs button{min-height:36px;padding:8px 12px;border:1px solid var(--line);background:none;font-size:11px}.ed-captures button:hover,.ed-outputs button:hover{background:var(--inset);border-color:var(--ink)}.ed-visual .evidence-page__guard{display:block;min-height:0;padding:24px 0;border:0;background:none;color:var(--ink)}.ed-visual .evidence-page__guard:before,.ed-visual .evidence-page__guard:after,.ed-visual .evidence-page__guard-meta,.ed-visual .evidence-page__guard-copy>small,.ed-visual .evidence-page__guard-empty,.ed-visual .evidence-page__guard-action{display:none}.ed-visual .evidence-page__guard-copy b{font-size:13px}.ed-visual .evidence-page__guard-copy p{font-size:12px;color:var(--muted);line-height:1.7;margin:8px 0}.ed-visual .evidence-page__guard-list{list-style:none;padding:0;margin:12px 0}.ed-visual .evidence-page__guard-list li{display:flex;flex-wrap:wrap;gap:8px;border-top:1px solid var(--line);padding:8px 0;font-size:11px}.ed-visual .evidence-page__guard-list small{margin-left:auto}
.ed-comparison{margin-top:24px}.ed-comparison h3{font-size:13px;margin:0 0 12px}.ed-comparison-stage{position:relative;width:100%;aspect-ratio:16/7;max-height:420px;overflow:hidden;background:var(--inset);border:1px solid var(--line)}.ed-compare-before,.ed-compare-after{position:absolute;inset:0}.ed-compare-after{clip-path:inset(0 0 0 50%)}.ed-comparison-stage img{display:block;width:100%;height:100%;object-fit:contain}.ed-compare-label{position:absolute;z-index:2;top:12px;left:12px;background:var(--ink);color:var(--paper);padding:4px 8px;font-size:10px}.ed-compare-label--after{left:auto;right:12px;background:var(--signal);color:#191919}.ed-compare-handle{position:absolute;top:0;bottom:0;left:50%;width:2px;background:var(--signal);box-shadow:0 0 0 1px #191919;pointer-events:none}.ed-compare-control{display:flex;align-items:center;gap:12px;font-size:11px;margin-top:12px}.ed-compare-control input{flex:1;accent-color:var(--ink)}.ed-compare-control output{min-width:3ch;text-align:right}
.ed-privacy dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 24px;margin:0}.ed-privacy dl>div{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);font-size:12px}.ed-privacy dt{flex:1;overflow-wrap:anywhere}.ed-privacy dd{flex:0 0 auto;font:16px var(--mono);margin:0}.ed-export-actions{display:flex;flex-wrap:wrap;gap:8px}.ed-outputs dl{margin:0}.ed-outputs dl>div{display:grid;grid-template-columns:112px minmax(0,1fr);gap:16px;border-bottom:1px solid var(--line);padding:12px 0;font-size:12px}.ed-outputs dd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0}.ed-outputs code{font:12px/1.5 var(--mono);overflow-wrap:anywhere;user-select:all}.ed-outputs dd button{border:0;flex:0 0 40px}.ed-notice{min-height:20px;font-size:12px;margin:8px 0 0}.ed-footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid var(--ink);padding:16px 0 24px;font:10px/1.6 var(--mono);color:var(--muted)}
.dijiang-console{visibility:visible}@keyframes ed-lateral-reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}
.loader.loader--field{--paper:#141414;--ink:#fff;--muted:#b3b3b3;--line:#424242;--inset:#353535;--contour:#fff;position:fixed;z-index:50;inset:0;background:transparent;color:var(--ink);overflow:hidden;animation:dijiang-reference-exit 2.4s step-end both}.field-loader-sheet{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:24px 48px;background:var(--paper);overflow:hidden;animation:ed-loader-sheet-exit 2.4s step-end both}.field-loader-sheet:before{content:'';position:absolute;inset:0;background-image:radial-gradient(var(--muted) .65px,transparent .65px);background-size:16px 16px;opacity:.15;pointer-events:none}.field-loader-sheet>.ed-contours{width:75%;opacity:.12;z-index:0}.field-loader-mast,.field-loader-center,.field-loader-statusbar{position:relative;z-index:1}.field-loader-mast{display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);padding-bottom:16px;font:11px var(--mono)}.field-loader-id{font-weight:700}.field-loader-project{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.field-loader-center{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,400px);gap:48px;align-items:center;width:min(100%,1200px);margin:auto}.field-loader-copy{min-width:0}.field-loader-kicker{display:block;color:var(--signal);font:12px var(--mono);margin-bottom:24px}.field-loader-copy strong{display:block;font-size:96px;font-weight:900;line-height:.98;overflow-wrap:anywhere;max-width:10ch;animation:ed-lateral-reveal .65s cubic-bezier(.16,1,.3,1) both}.field-loader-copy p{color:var(--muted);font-size:13px;margin:24px 0 0;max-width:60ch;overflow-wrap:anywhere}.field-loader-instrument{width:100%;height:auto;max-height:400px;overflow:visible;fill:none;stroke:var(--ink);stroke-width:1}.field-loader-instrument .instrument-halo,.field-loader-instrument .instrument-ring,.field-loader-instrument .instrument-ticks,.field-loader-instrument .instrument-sweep,.field-loader-instrument .instrument-cross{transform-box:view-box;transform-origin:160px 160px}.instrument-halo{stroke-dasharray:1 8;animation:dijiang-instrument-spin 36s linear infinite}.instrument-ring--outer{stroke-dasharray:220 50 40 40;stroke-width:2;animation:dijiang-instrument-spin 12s linear infinite}.instrument-ring--inner{stroke-dasharray:120 35;animation:dijiang-instrument-spin-reverse 8s linear infinite}.instrument-ring--core{stroke-width:8;stroke-dasharray:50 35;stroke:var(--signal);animation:dijiang-instrument-core-spin 3s linear infinite}.instrument-ticks{stroke-width:1}.instrument-tick--major{stroke-width:3}.instrument-cross{stroke:var(--line);stroke-dasharray:2 5}.instrument-sweep{stroke:var(--signal);stroke-width:2;animation:dijiang-loader-sweep-rotate 3s linear infinite}.instrument-node{fill:var(--signal);stroke:var(--ink)}.instrument-label{fill:var(--ink);stroke:none;text-anchor:middle;font:8px Arial,sans-serif}.field-loader-statusbar{border-top:1px solid var(--line);padding-top:16px}.field-loader-readout{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:16px}.field-loader-status{font-size:12px}.field-loader-readout>b{font:48px var(--mono);color:var(--signal)}.field-loader-progress{position:relative;display:block;width:100%;height:20px;background:var(--inset);border:1px solid var(--line);overflow:hidden}.field-loader-progress em{position:absolute;inset:0;background:var(--signal);transform:scaleX(0);transform-origin:left}.field-loader-progress:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 39px,#141414 39px 40px);opacity:.2}.field-loader-stages{display:flex;justify-content:space-between;gap:16px;margin-top:12px;font:10px var(--mono);color:var(--muted)}.field-loader-stages b{font-weight:400}.field-loader-topband{position:absolute;z-index:3;top:-8%;left:-25%;width:150%;height:116%;bottom:auto;border:0;background:var(--signal);transform:translateX(-120%) skewX(-14deg);animation:dijiang-yellow-transfer 2.4s cubic-bezier(.65,0,.25,1) both;pointer-events:none}@keyframes dijiang-yellow-transfer{0%,64%{transform:translateX(-120%) skewX(-14deg)}79%{transform:translateX(0) skewX(-14deg)}100%{transform:translateX(120%) skewX(-14deg)}}@keyframes ed-loader-sheet-exit{0%,79%{visibility:visible}79.1%,100%{visibility:hidden}}@keyframes dijiang-reference-exit{0%,99.9%{visibility:visible}100%{visibility:hidden;pointer-events:none}}@keyframes dijiang-instrument-spin{to{transform:rotate(360deg)}}@keyframes dijiang-instrument-spin-reverse{to{transform:rotate(-360deg)}}@keyframes dijiang-instrument-core-spin{to{transform:rotate(360deg)}}@keyframes dijiang-loader-sweep-rotate{to{transform:rotate(360deg)}}
html[data-dijiang-motion=accessible]{scroll-behavior:auto}html[data-dijiang-motion=accessible] .loader.loader--field{animation:dijiang-reference-reduced-exit .15s linear both}html[data-dijiang-motion=accessible] .loader.loader--field *{animation:none!important}html[data-dijiang-motion=accessible] .field-loader-topband{display:none}html[data-dijiang-motion=accessible] .dijiang-console *{animation:none!important;transition:none!important}@keyframes dijiang-reference-reduced-exit{to{opacity:0;visibility:hidden}}
@media(min-width:761px){.ed-captures:has(>details:only-child){grid-template-columns:1fr;max-width:960px}.ed-captures:has(>details:only-child) .ed-shot{height:auto;aspect-ratio:16/10;max-height:480px}.ed-captures:has(>details:nth-child(2):last-child){grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1700px){.ed-heading h1{font-size:72px}.ed-heading{padding:40px 0}.ed-ledger.delivery-manifest{gap:48px}}
@media(max-width:1100px){.ed-heading h1{font-size:48px}.ed-heading{grid-template-columns:minmax(0,1fr) 240px;gap:24px}.ed-shell{padding:0 24px}.ed-ledger.delivery-manifest{gap:24px}.ed-receipts summary{grid-template-columns:16px minmax(0,1fr) 12px}.ed-receipt-result{grid-column:2;text-align:left;display:flex;align-items:baseline;gap:8px}.ed-receipts summary:after{grid-column:3;grid-row:1}.ed-side{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.ed-scope{display:none}.field-loader-copy strong{font-size:72px}.field-loader-center{gap:24px}.ed-files .ed-delta{font-size:11px}}
@media(max-width:760px){:root{--topbar:56px;--rail:0px}html{scroll-padding-top:76px}.poster.dijiang-console{padding-bottom:72px}.ed-mast{padding:0 16px}.ed-brand{gap:8px}.ed-brand>b{width:32px;height:32px;font-size:16px}.ed-brand>span{font-size:12px}.ed-brand small{font-size:8px}.ed-mast-meta{gap:8px}.ed-mast-meta>span:first-child{display:none}.ed-mast-meta>span:last-of-type{font-size:9px}.ed-stages.current-route{inset:auto 0 0;width:100%;height:64px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:0;border-right:0;border-top:1px solid var(--ink);background:var(--paper);overflow:visible}.ed-stages a{min-height:0;border-left:0;border-top:3px solid transparent;border-bottom:0;border-right:1px solid var(--line);gap:2px}.ed-stages a[aria-current]{border-top-color:var(--ink)}.ed-stages a:last-child{border-right:0}.ed-stages b{font-size:12px}.ed-stages span{font-size:11px}.ed-stages:after{display:none}.ed-shell{padding:0 16px}.ed-heading{grid-template-columns:1fr;gap:24px;padding:24px 0}.ed-heading h1{font-size:36px;margin-bottom:16px}.ed-heading-code{margin-bottom:16px;gap:8px;font-size:11px}.ed-heading-code>span{font-size:10px}.ed-task{font-size:13px}.ed-contours{width:100%;opacity:.1}.ed-station{padding:16px;border-top:3px solid var(--signal)}.ed-station>header{font-size:11px}.ed-verdict{margin:12px 0}.ed-verdict strong{font-size:26px}.ed-metrics>div{flex-direction:row;align-items:baseline;justify-content:space-between;padding:8px 0;gap:12px}.ed-metrics b{font-size:20px}.ed-station footer{padding-top:8px}.ed-side{gap:16px;padding:16px 0;margin-bottom:24px;grid-template-columns:1fr}.ed-meta{grid-template-columns:1fr 1fr;padding:12px 0 0;border-left:0;border-top:1px solid var(--line)}.ed-review ul{margin-top:4px}.ed-overview dd,.ed-overview .ed-delta{font-size:16px}.ed-overview dl>div{padding:12px 8px 12px 0}.ed-section{margin-bottom:24px}.ed-section-head h2{font-size:15px}.ed-ledger.delivery-manifest{display:block}.ed-captures{grid-template-columns:1fr;gap:16px}.ed-captures .ed-shot{height:256px}.ed-comparison-stage{aspect-ratio:1.2}.ed-captures button,.ed-outputs button{min-height:44px}.ed-privacy dl{grid-template-columns:1fr}.ed-outputs dl>div{grid-template-columns:1fr;gap:4px}.ed-outputs code{font-size:11px}.ed-section-head>span{font-size:10px}.ed-receipts summary{grid-template-columns:16px minmax(0,1fr) 12px}.ed-preferences{right:0}.field-loader-sheet{padding:16px}.field-loader-mast{font-size:9px;gap:12px;padding-bottom:12px}.field-loader-center{grid-template-columns:1fr;gap:16px;padding:24px 0}.field-loader-copy strong{font-size:56px}.field-loader-kicker{font-size:10px;margin-bottom:16px}.field-loader-copy p{font-size:11px;margin-top:16px}.field-loader-instrument{max-height:240px}.field-loader-readout>b{font-size:28px}.field-loader-stages{font-size:9px;gap:8px}.field-loader-status{font-size:11px}.field-loader-project{max-width:45%}}
@media(max-width:760px){.ed-option-row{min-height:44px}.ed-options span{min-height:44px}.ed-settings>summary{width:44px;height:44px}}
@media(max-width:760px) and (max-height:700px){.field-loader-center{grid-template-columns:minmax(0,1fr) 112px;gap:16px}.field-loader-copy strong{font-size:40px}.field-loader-instrument{max-height:112px}.field-loader-copy p{max-height:48px;overflow:hidden}}
@media(min-width:761px) and (max-height:750px){.ed-heading{padding:20px 0}.ed-heading h1{margin-bottom:12px}.ed-station{padding:16px}.ed-verdict{margin:12px 0}.ed-verdict strong{font-size:26px}.ed-metrics>div{padding:8px 0}.ed-metrics b{font-size:20px}.ed-side{padding:12px 0;margin-bottom:20px}.ed-overview dl>div{padding-top:12px;padding-bottom:12px}.ed-overview{margin-bottom:24px}}
@media(min-width:761px) and (max-height:650px){.field-loader-sheet{padding:16px 32px}.field-loader-instrument{max-height:260px}.field-loader-copy strong{font-size:64px}.field-loader-center{grid-template-columns:minmax(0,1fr) 260px}.ed-heading{padding:20px 0}}
@media(prefers-reduced-motion:reduce){html:not([data-dijiang-motion=full]){scroll-behavior:auto}html:not([data-dijiang-motion=full]) *{animation:none!important;transition:none!important}}
/* Industrial editorial override: keep status semantics monochrome and give the report a quieter reading rhythm. */
.ed-receipt-mark{display:grid;place-items:center;width:16px;height:16px;color:#191919;background:var(--signal);font-size:11px;font-weight:900}.ed-receipts [data-status=failed] .ed-receipt-result{color:var(--ink);text-decoration:underline;text-decoration-color:var(--signal);text-decoration-thickness:2px;text-underline-offset:3px}.ed-receipts [data-status=failed] .ed-receipt-mark{color:var(--ink);background:var(--surface);border:1px solid var(--ink)}
@media(min-width:1101px){.ed-shell{max-width:1440px;padding-inline:56px}.ed-heading{gap:64px;padding:56px 0 64px}.ed-heading-code{margin-bottom:28px}.ed-heading h1{margin-bottom:24px}.ed-task{line-height:1.8}.ed-station{padding:24px}.ed-verdict{margin:24px 0}.ed-metrics{gap:24px}.ed-metrics>div{padding:16px 0;gap:6px}.ed-workspace{padding-bottom:48px}.ed-side{gap:40px;padding:32px 0;margin-bottom:48px}.ed-review ul{margin-top:12px}.ed-review p,.ed-review li{line-height:1.8}.ed-review p{margin-top:12px}.ed-meta{gap:12px;padding-left:32px}.ed-meta dd{line-height:1.6}.ed-scope{padding-left:32px}.ed-scope p{line-height:1.8;margin-top:12px}.ed-section{margin-bottom:48px}.ed-section-head{padding-bottom:16px}.ed-overview dl>div{padding:24px 32px}.ed-overview dd{margin-top:12px}}
@media(max-width:760px){.poster.dijiang-console{padding-bottom:0}.ed-stages.current-route{position:sticky;top:var(--topbar);bottom:auto;z-index:25}}
/* Bold industrial hero: a single structural peak carries the extra energy. */
.ed-bridge>.ed-shell{position:relative;z-index:1}.ed-bridge:after{content:'';position:absolute;z-index:0;top:0;right:0;width:34%;height:100%;background:var(--ink);opacity:.055;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,12% 54%);pointer-events:none}.ed-heading{position:relative}.ed-heading:after{content:'';position:absolute;z-index:0;top:0;right:31%;width:12px;height:100%;background:var(--signal);clip-path:polygon(28% 0,100% 0,72% 100%,0 100%);opacity:.92;pointer-events:none}.ed-heading>div,.ed-heading>.ed-station{position:relative;z-index:1}.ed-heading h1{font-size:clamp(4rem,5.7vw,6rem);letter-spacing:-.025em}.ed-contours{width:68%;opacity:.2}.ed-station{width:100%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}.ed-overview{position:relative;padding-top:16px;border-top:4px solid var(--signal)}
@media(max-width:1100px){.ed-heading:after{right:29%;width:8px}.ed-heading h1{font-size:48px}.ed-contours{width:64%;opacity:.17}}
@media(max-width:760px){.ed-bridge:after{width:30%;opacity:.045}.ed-heading:after{right:10%;top:0;width:7px;height:100%;opacity:.72}.ed-heading h1{font-size:40px;letter-spacing:-.015em}.ed-contours{width:100%;opacity:.14}.ed-overview{padding-top:10px;border-top-width:3px}}
@media print{.loader,.ed-mast,.ed-stages,.ed-settings,.ed-skip,.ed-export-actions,.ed-outputs button,.ed-captures button,.ed-contours{display:none!important}body{background:#fff;color:#191919}.poster.dijiang-console{padding:0;min-height:0}.ed-shell{padding:0}.ed-ledger.delivery-manifest{display:block}.ed-diff-panel[hidden]{display:block!important}.ed-diff-code,.ed-receipts pre{max-height:none}.ed-side{display:block}.ed-meta{border:0;padding:0}.ed-comparison{display:none}.ed-captures{grid-template-columns:1fr}*{animation:none!important;transition:none!important}}
/* Endfield workbench pass: a dark contour stage, oversized watermark and signal field. */
.poster.dijiang-console{--paper:#edede9;--ink:#202124;--muted:#7f8580;--line:#c4c7c0;--surface:#eeeeea;--inset:#f7f7f2;--signal:#ded344;--signal-hot:#ded344;--contour:#858b87;--coal:#111214;--coal-soft:#242629;background:var(--paper)}
.dijiang-console .ed-mast{background:var(--coal);color:#f2f2ed;border-bottom-color:#515459}.dijiang-console .ed-brand>b{background:var(--signal);color:var(--coal)}.dijiang-console .ed-brand small{color:#aeb3ae}.dijiang-console .ed-mast-meta{color:#aeb3ae}.dijiang-console .ed-mast-meta>span:last-of-type{border-color:#515459}.dijiang-console .ed-settings>summary{border-color:#515459;color:#f2f2ed}.dijiang-console .ed-settings[open]>summary{background:var(--signal);color:var(--coal);border-color:var(--signal)}
.dijiang-console .ed-stages.current-route{background:var(--coal);border-right-color:#515459}.dijiang-console .ed-stages a{color:#f2f2ed}.dijiang-console .ed-stages a[aria-current]{background:var(--signal);color:var(--coal);border-left-color:var(--signal)}.dijiang-console .ed-stages a:hover{background:var(--coal-soft);color:#f2f2ed}.dijiang-console .ed-stages:after{color:#8e948f}
.dijiang-console .ed-bridge{background:var(--coal);color:#f2f2ed;border-bottom:12px solid var(--signal);min-height:420px}.dijiang-console .ed-bridge:before{z-index:0;inset:0;background-image:linear-gradient(rgba(242,242,237,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(242,242,237,.045) 1px,transparent 1px),radial-gradient(circle at 76% 48%,rgba(222,211,68,.16),transparent 28%);background-size:48px 48px,48px 48px,auto;opacity:.82}.dijiang-console .ed-bridge:after{content:'ENDFIELD';top:38%;right:-3%;width:auto;height:auto;background:none;opacity:.1;clip-path:none;color:#f2f2ed;font:900 clamp(7rem,15vw,14rem)/.7 Arial,'Helvetica Neue','Microsoft YaHei',sans-serif;letter-spacing:-.07em;white-space:nowrap;transform:skewX(-12deg);pointer-events:none}.dijiang-console .ed-contours{z-index:0;width:92%;opacity:.3;mask-image:linear-gradient(90deg,transparent 0,#000 14%,#000 100%)}.dijiang-console .ed-contours path{fill:none;stroke:#858b87;stroke-width:1.2;stroke-dasharray:2 8;stroke-linecap:round}
.dijiang-console .ed-heading{min-height:420px;padding:72px 0 76px;overflow:visible}.dijiang-console .ed-heading:before{content:'';position:absolute;z-index:0;right:23%;bottom:-12px;width:28%;height:74px;background:var(--signal);clip-path:polygon(12% 0,100% 0,88% 100%,0 100%);opacity:.78;pointer-events:none}.dijiang-console .ed-heading:after{right:30%;background:var(--signal-hot);opacity:.95}.dijiang-console .ed-heading>div,.dijiang-console .ed-heading>.ed-station{z-index:1}.dijiang-console .ed-heading-code{color:#f2f2ed}.dijiang-console .ed-heading-code>span{color:#aeb3ae}.dijiang-console .ed-heading-code:before{background:var(--signal);border-left-color:#f2f2ed}.dijiang-console .ed-heading h1{color:#f2f2ed;font-size:clamp(4rem,6.4vw,6.75rem);letter-spacing:-.03em;max-width:12ch}.dijiang-console .ed-heading h1:after{content:'';display:block;width:6rem;height:7px;margin-top:24px;background:var(--signal-hot);clip-path:polygon(10% 0,100% 0,90% 100%,0 100%)}.dijiang-console .ed-task{color:#d2d6d1;max-width:52ch}.dijiang-console .ed-station{--ink:#f2f2ed;--paper:var(--coal-soft);--muted:#aeb3ae;--line:#515459;background:var(--coal-soft);border-color:#515459;border-top-color:var(--signal-hot);box-shadow:inset 0 0 0 1px rgba(242,242,237,.08)}.dijiang-console .ed-verdict>span{background:var(--signal);color:var(--coal)}.dijiang-console .ed-verdict strong{color:#f2f2ed}.dijiang-console .ed-metrics>div{border-top-color:#515459}.dijiang-console .ed-metrics small,.dijiang-console .ed-station footer{color:#aeb3ae}.dijiang-console .ed-metrics b{color:#f2f2ed}.dijiang-console .ed-station footer{border-top-color:#515459}
.dijiang-console .ed-workspace{background:var(--paper)}.dijiang-console .ed-side{border-bottom-color:var(--line)}.dijiang-console .ed-overview{border-top-color:var(--signal)}
@media(max-width:1100px){.dijiang-console .ed-bridge{min-height:360px}.dijiang-console .ed-heading{min-height:360px;padding:52px 0 60px}.dijiang-console .ed-heading h1{font-size:clamp(3.25rem,7vw,4.5rem)}.dijiang-console .ed-heading:before{right:18%;width:34%;height:60px}.dijiang-console .ed-heading:after{right:28%;width:8px}.dijiang-console .ed-bridge:after{font-size:15vw}}
@media(max-width:760px){.dijiang-console .ed-mast{background:var(--coal)}.dijiang-console .ed-stages.current-route{background:var(--coal)}.dijiang-console .ed-bridge{min-height:0;border-bottom-width:8px}.dijiang-console .ed-heading{min-height:0;padding:40px 0 48px}.dijiang-console .ed-heading h1{font-size:42px;max-width:9ch}.dijiang-console .ed-heading h1:after{margin-top:16px;width:4.5rem;height:5px}.dijiang-console .ed-heading:before{right:3%;bottom:30%;width:52%;height:48px;opacity:.55}.dijiang-console .ed-heading:after{right:8%;width:7px}.dijiang-console .ed-bridge:after{top:43%;right:-8%;font-size:26vw;opacity:.1}.dijiang-console .ed-contours{width:120%;opacity:.22}}
/* Taste pass: make the homepage read as an assertive industrial editorial stage. */
.dijiang-console .ed-mast{border-bottom:0;box-shadow:0 1px 0 #515459,0 8px 0 rgba(17,18,20,.18)}
.dijiang-console .ed-mast:before{content:'01';position:absolute;left:0;top:0;width:5px;height:100%;display:grid;place-items:center;background:var(--signal);color:var(--coal);font:900 8px var(--mono);writing-mode:vertical-rl}
.dijiang-console .ed-brand{margin-left:8px}
.dijiang-console .ed-bridge{min-height:clamp(500px,calc(100svh - var(--topbar)),720px);border-bottom-width:16px;isolation:isolate}
.dijiang-console .ed-bridge:before{background-size:32px 32px,32px 32px,auto;opacity:1}
.dijiang-console .ed-bridge:after{top:21%;right:-9%;font-size:clamp(9rem,18vw,17rem);opacity:.13;transform:skewX(-14deg) rotate(-3deg)}
.dijiang-console .ed-bridge .ed-shell:after{content:'SECTOR 01  /  DELIVERY FIELD  /  LOCAL';position:absolute;right:56px;bottom:22px;color:#8e948f;font:10px var(--mono);letter-spacing:.08em;z-index:2;white-space:nowrap}
.dijiang-console .ed-contours{width:108%;opacity:.42;mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 100%)}
.dijiang-console .ed-heading{min-height:clamp(500px,calc(100svh - var(--topbar) - 16px),704px);padding:clamp(56px,8vh,104px) 0 clamp(72px,10vh,128px);align-items:center}
.dijiang-console .ed-heading>div:first-child{position:relative}
.dijiang-console .ed-heading>div:first-child:before{content:'01';position:absolute;z-index:-1;left:-.08em;top:-.34em;color:#f2f2ed;font:900 clamp(11rem,22vw,22rem)/.8 Arial,'Helvetica Neue','Microsoft YaHei',sans-serif;letter-spacing:-.1em;opacity:.085;pointer-events:none}
.dijiang-console .ed-heading-code{position:relative;padding-left:44px;letter-spacing:.08em;text-transform:uppercase}
.dijiang-console .ed-heading-code:before{position:absolute;left:0;top:50%;transform:translateY(-50%) skewX(-18deg);width:32px;height:16px;border-left-width:6px}
.dijiang-console .ed-heading h1{position:relative;z-index:1;max-width:10ch;font-size:clamp(4.4rem,7.2vw,8.5rem);line-height:.9;text-transform:uppercase;text-wrap:pretty}
.dijiang-console .ed-heading h1:before{content:'';display:block;width:9rem;height:1px;margin-bottom:20px;background:#858b87;box-shadow:8rem 0 0 var(--signal),16rem 0 0 #858b87}
.dijiang-console .ed-heading h1:after{width:8rem;height:10px;margin-top:30px}
.dijiang-console .ed-task{max-width:44ch;font-size:16px;line-height:1.65;border-left:2px solid var(--signal);padding-left:16px}
.dijiang-console .ed-station{position:relative;align-self:end;clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%);border-width:1px;border-top-width:4px;padding:28px 24px 24px;box-shadow:12px 12px 0 rgba(222,211,68,.18),inset 0 0 0 1px rgba(242,242,237,.08)}
.dijiang-console .ed-station:before{content:'FIELD READOUT';position:absolute;right:20px;top:8px;color:#aeb3ae;font:9px var(--mono);letter-spacing:.08em}
.dijiang-console .ed-verdict{margin:32px 0}.dijiang-console .ed-verdict>span{min-width:32px;height:40px}.dijiang-console .ed-verdict strong{font-size:34px;text-transform:uppercase}
.dijiang-console .ed-overview{padding-top:20px;border-top-width:6px}.dijiang-console .ed-overview dl{border-bottom-color:#858b87}
@media(max-width:1100px){.dijiang-console .ed-bridge{min-height:clamp(430px,calc(100svh - var(--topbar)),620px);border-bottom-width:12px}.dijiang-console .ed-heading{min-height:clamp(430px,calc(100svh - var(--topbar) - 12px),608px);padding:56px 0 72px}.dijiang-console .ed-heading h1{font-size:clamp(3.7rem,8vw,6rem)}.dijiang-console .ed-heading>div:first-child:before{font-size:20vw}.dijiang-console .ed-station{padding:24px 20px}.dijiang-console .ed-bridge .ed-shell:after{right:24px;bottom:16px}}
@media(max-width:760px){.dijiang-console .ed-mast:before{width:4px}.dijiang-console .ed-brand{margin-left:4px}.dijiang-console .ed-bridge{min-height:0;border-bottom-width:8px}.dijiang-console .ed-bridge:before{background-size:24px 24px,24px 24px,auto}.dijiang-console .ed-bridge:after{top:26%;right:-16%;font-size:36vw;opacity:.11}.dijiang-console .ed-bridge .ed-shell:after{right:16px;bottom:12px;font-size:8px}.dijiang-console .ed-contours{width:145%;opacity:.3}.dijiang-console .ed-heading{min-height:0;padding:48px 0 64px}.dijiang-console .ed-heading>div:first-child:before{left:-.04em;top:-.2em;font-size:48vw}.dijiang-console .ed-heading h1{font-size:clamp(3rem,14vw,4.5rem);line-height:.94;max-width:8ch}.dijiang-console .ed-heading h1:before{width:5rem;margin-bottom:14px;box-shadow:5rem 0 0 var(--signal),10rem 0 0 #858b87}.dijiang-console .ed-heading h1:after{width:5rem;height:6px;margin-top:18px}.dijiang-console .ed-task{font-size:13px;padding-left:12px}.dijiang-console .ed-station{align-self:stretch;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%);padding:20px 16px 16px;box-shadow:6px 6px 0 rgba(222,211,68,.16),inset 0 0 0 1px rgba(242,242,237,.08)}.dijiang-console .ed-station:before{right:14px;top:6px;font-size:8px}.dijiang-console .ed-verdict{margin:20px 0}.dijiang-console .ed-verdict strong{font-size:28px}.dijiang-console .ed-overview{padding-top:12px;border-top-width:4px}}
`;


// Finish the v2 presentation without overriding the user's display preferences.
export const dijiangRefinementCss = `

.poster.dijiang-console { --muted:#59635b;--signal-hot:var(--signal); }
:root[data-ed-palette=dark] .poster.dijiang-console {
  --paper:#191919;--ink:#f2f2ed;--muted:#b3b8b2;--line:#454945;--surface:#252525;--inset:#353535;
}
:root[data-ed-accent=cyan] .poster.dijiang-console { --signal:#14d0d0; }
.dijiang-console *,.dijiang-console *::before,.dijiang-console *::after { letter-spacing:0; }

/* Reveal underneath the loader, never restart after the yellow wipe. */
@keyframes ed-lateral-reveal-v2 {
  from { clip-path:inset(0 6% 0 0); }
  to   { clip-path:inset(0); }
}
.dijiang-console .ed-heading,
.dijiang-console .ed-main {
  animation:ed-lateral-reveal-v2 .55s cubic-bezier(.16,1,.3,1) both;
}
.dijiang-console .ed-heading h1 { font-size:112px;line-height:1.04;letter-spacing:0; }
.dijiang-console .ed-bridge:after { font-size:240px;letter-spacing:0; }
.dijiang-console .ed-heading > div:first-child:before { font-size:288px; }
.dijiang-console .ed-heading-code,.dijiang-console .ed-station:before,
.dijiang-console .ed-bridge .ed-shell:after { letter-spacing:0; }

/* Mast: warmer layered shadow */
.dijiang-console .ed-mast {
  box-shadow:0 1px 0 #4a4d52,0 6px 18px rgba(12,13,14,.22);
}

/* Brand icon: subtle signal underline */
.dijiang-console .ed-brand > b {
  box-shadow:inset 0 -2px 0 rgba(255,250,0,.18);
}

/* Watermark number: a touch crisper */
.dijiang-console .ed-heading > div:first-child:before {
  opacity:.07;
  letter-spacing:0;
}

/* Rule lines: longer second segment */
.dijiang-console .ed-heading h1:before {
  box-shadow:8rem 0 0 var(--signal),17rem 0 0 #858b87;
}

/* Task text: slightly more readable off-white */
.dijiang-console .ed-task {
  color:rgba(242,242,237,.82);
  line-height:1.7;
  border-left:0;padding-left:0;
}

/* Station card: stronger corner-shadow accent */
.dijiang-console .ed-station {
  --surface:#303438;--inset:#383d40;
  box-shadow:14px 14px 0 rgba(222,211,68,.16),inset 0 0 0 1px rgba(242,242,237,.07);
}

/* Verdict symbol: always signal-coloured */
.dijiang-console .ed-verdict > span {
  background:var(--signal);
  color:#191919;
  font-weight:900;
}
.dijiang-console[data-status=failed] .ed-verdict > span {
  background:transparent;
  border:1.5px solid var(--signal);
  color:var(--signal);
}

/* Metric rows: top accent + hover + bigger number */
.dijiang-console[data-demo=true] .ed-verdict strong {
  font-size:18px;
  line-height:1.4;
  text-transform:none;
  text-wrap:balance;
}

.dijiang-console .ed-metrics > div {
  border-top-width:2px;
  transition:background .15s;
}
.dijiang-console .ed-metrics > div:hover { background:var(--surface); }
.dijiang-console .ed-metrics b { font-size:26px; }

/* Section head: signal left bar */
.dijiang-console .ed-section-head h2:before {
  width:5px;flex-basis:5px;height:16px;background:var(--signal);
}

/* File list: pressed state with signal inset */
.dijiang-console .ed-files button[aria-pressed=true] {
  box-shadow:inset 0 0 0 1px var(--ink);
  background:color-mix(in srgb,var(--signal) 16%,var(--paper));
}

/* Diff code: readable line height + semantic diff colours */
.dijiang-console .ed-diff-code { line-height:1.75; }
.dijiang-console .ed-diff-line.addition { color:#216d37; }
.dijiang-console .ed-diff-line.deletion { color:#a73345; }
.dijiang-console .ed-diff-line.hunk {
  background:color-mix(in srgb,var(--signal) 18%,var(--paper));
  color:var(--ink);
}

/* Receipt rows: slightly more padding */
.dijiang-console .ed-receipts summary { padding:14px 10px; }

/* Capture shot: thin border */
.dijiang-console .ed-captures .ed-shot { border:1px solid var(--line); }

/* Comparison after label: signal fill */
.dijiang-console .ed-compare-label--after { background:var(--signal);color:#191919;font-weight:700; }

/* Footer: baseline-align */
.dijiang-console .ed-footer { align-items:baseline;padding-top:20px; }

/* Preferences panel: tighter shadow */
.dijiang-console .ed-preferences {
  color:var(--ink);
  box-shadow:8px 8px 0 color-mix(in srgb,var(--ink) 10%,transparent);
}
.dijiang-console .ed-mast :focus-visible,
.dijiang-console .ed-stages a:focus-visible { outline-color:var(--signal); }
.dijiang-console .ed-preferences :focus-visible { outline-color:var(--ink); }
.dijiang-console .ed-stages a:focus-visible { outline-offset:-4px; }

/* Sidebar current indicator */
.dijiang-console .ed-stages a[aria-current],
.dijiang-console .ed-stages a[aria-current]:hover { background:var(--signal);color:var(--coal); }
.dijiang-console .ed-stages a[aria-current] b { color:inherit; }
.dijiang-console .ed-stages a[aria-current]:focus-visible { outline-color:var(--coal); }

@media(max-width:1100px) {
  .dijiang-console .ed-heading h1 { font-size:80px; }
  .dijiang-console .ed-bridge:after { font-size:160px; }
  .dijiang-console .ed-heading > div:first-child:before { font-size:224px; }
}
@media(max-width:760px) {
  .dijiang-console .ed-heading h1 { font-size:48px;max-width:100%; }
  .dijiang-console .ed-heading > div:first-child:before { font-size:176px; }
  .dijiang-console .ed-heading h1:before { box-shadow:5rem 0 0 var(--signal),10rem 0 0 #858b87; }
  .dijiang-console .ed-metrics { gap:16px; }
  .dijiang-console .ed-metrics > div { flex-wrap:wrap;gap:4px 12px; }
  .dijiang-console .ed-metrics b { font-size:22px; }
  .dijiang-console .ed-task { padding-left:0; }
}
@media(max-width:380px) {
  .dijiang-console .ed-heading h1 { font-size:40px; }
}

/* Dark mode diff colour overrides */
:root[data-ed-palette=dark] .dijiang-console .ed-diff-line.addition { color:#72d17e; }
:root[data-ed-palette=dark] .dijiang-console .ed-diff-line.deletion { color:#e07878; }

/* Reduced motion */
@media(prefers-reduced-motion:reduce) {
  .dijiang-console .ed-heading,
  .dijiang-console .ed-main {
    animation:none;opacity:1;clip-path:none;
  }
}
`;
