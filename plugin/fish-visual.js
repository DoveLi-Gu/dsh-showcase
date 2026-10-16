// Shared by the React preview and the self-contained npm report.
export const fishVisualCss = `
/* Fish Visual v7: report-aware expressions and bounded, optional pointer feedback. */
html:has(.poster[data-theme="blue-big-fish"]) { font-size:16px; }
.poster[data-theme="blue-big-fish"] {
  border:0;box-shadow:none;background:#f6fbff;isolation:isolate;
}
.poster[data-theme="blue-big-fish"] .poster-layout {
  width:min(calc(100% - 6rem),80rem);margin-inline:auto;padding:0 0 1.5rem;
  grid-template-columns:minmax(0,1fr);
  grid-template-areas:'copy' 'route' 'evidence' 'footer';
  grid-template-rows:auto auto auto auto;gap:0;
}
.poster[data-theme="blue-big-fish"] .copy { align-self:start;max-width:none;position:relative;z-index:2;padding:2rem 0 0;isolation:isolate; }
.poster[data-theme="blue-big-fish"] .copy:before,
.poster[data-theme="blue-big-fish"] .copy:after { content:none; }
.poster[data-theme="blue-big-fish"] .fish-mast { display:flex;align-items:center;justify-content:space-between;gap:1rem; }
.poster[data-theme="blue-big-fish"] .fish-motion-control { display:flex;align-items:center;gap:.45rem;min-height:44px;flex-shrink:0;color:#46647d;font:600 .8125rem/1.3 Arial,'Microsoft YaHei',sans-serif;cursor:pointer; }
.poster[data-theme="blue-big-fish"] .fish-motion-control[hidden] { display:none; }
.poster[data-theme="blue-big-fish"] .fish-motion-control input { accent-color:#0757cf;width:20px;height:20px;margin:0;cursor:pointer; }
.poster[data-theme="blue-big-fish"] .fish-motion-control input:focus-visible { outline:3px solid #0757cf;outline-offset:3px; }
.poster[data-theme="blue-big-fish"] .fish-brief {
  position:relative;isolation:isolate;display:grid;min-width:0;
  grid-template-columns:280px minmax(0,1fr);grid-template-areas:'portrait message' 'portrait metrics';
  gap:1.5rem 2.5rem;padding:1.75rem 0 2rem;margin-top:1.75rem;
}
.poster[data-theme="blue-big-fish"] .fish-brief:before {
  content:'';position:absolute;z-index:-1;inset:0 calc(50% - 50vw);background:#0757cf;border-bottom:6px solid #ffd24a;pointer-events:none;
}
.poster[data-theme="blue-big-fish"] .fish-brief__message {
  grid-area:message;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;min-width:0;
}
.poster[data-theme="blue-big-fish"] .fish-status-wrap { flex:0 0 auto;max-width:45%; }
.poster[data-theme="blue-big-fish"] .fish-status-wrap .verified { margin:0;padding:.6rem .85rem;box-shadow:none; }
.poster[data-theme="blue-big-fish"] .portrait-field {
  position:relative;inset:auto;grid-area:portrait;align-self:stretch;
  width:100%;height:auto;min-height:150px;overflow:visible;isolation:auto;padding:0;
  z-index:2;
}
.poster[data-theme="blue-big-fish"] .portrait-field:before,
.poster[data-theme="blue-big-fish"] .portrait-field:after { content:none; }
.poster[data-theme="blue-big-fish"] .fish-companion { position:absolute;inset:auto 0 -2rem;display:block;width:100%;aspect-ratio:1.5;color:#0757cf;text-decoration:none;outline:0; }
.poster[data-theme="blue-big-fish"] .fish-companion:after { content:'';position:absolute;inset:0 5%;border:3px solid transparent;pointer-events:none; }
.poster[data-theme="blue-big-fish"] .fish-companion:focus-visible:after { border-color:#ffd24a; }
.poster[data-theme="blue-big-fish"] .fish-companion__body { position:absolute;inset:auto 0 0;width:100%;aspect-ratio:1;transform-origin:50% 100%;pointer-events:none; }
.poster[data-theme="blue-big-fish"] .portrait-field .art {
  mix-blend-mode:normal;
  object-fit:contain;
  object-position:50% 100%;
  inset:0;width:100%;height:100%;aspect-ratio:1;
  opacity:1;mask-image:none;filter:none;transform-origin:50% 100%;
  animation:none;
}
.poster[data-theme="blue-big-fish"] .portrait-field .art-response {
  position:absolute;inset:0;width:100%;height:100%;aspect-ratio:1;object-fit:contain;opacity:0;
}
.poster[data-theme="blue-big-fish"] .fish-brief[data-fish-attention] .art,
.poster[data-theme="blue-big-fish"] .fish-companion:focus-visible .art { opacity:0; }
.poster[data-theme="blue-big-fish"] .fish-brief[data-fish-attention] .art-response,
.poster[data-theme="blue-big-fish"] .fish-companion:focus-visible .art-response { opacity:1; }
.poster[data-theme="blue-big-fish"] .fish-companion__cue { position:absolute;bottom:calc(100% + 10px);left:10%;max-width:90%;padding:.5rem .65rem;background:#fff3c4;color:#174478;font:700 .8125rem/1.4 Arial,'Microsoft YaHei',sans-serif;opacity:0;pointer-events:none;overflow-wrap:anywhere; }
.poster[data-theme="blue-big-fish"] .fish-companion__cue:after { content:'';position:absolute;bottom:-7px;left:20px;width:12px;height:8px;background:inherit;clip-path:polygon(0 0,100% 0,0 100%); }
.poster[data-theme="blue-big-fish"] .fish-brief[data-fish-attention] .fish-companion__cue,
.poster[data-theme="blue-big-fish"] .fish-companion:focus-visible .fish-companion__cue { opacity:1; }
.poster[data-theme="blue-big-fish"] .fish-brief[data-fish-attention="task"] .task { border-color:#fff3c4; }
.poster[data-theme="blue-big-fish"] .fish-brief[data-fish-attention="status"] .verified { box-shadow:0 0 0 3px #80aff1; }
.poster[data-theme="blue-big-fish"] .metric[data-fish-active] b { color:#fff0a8; }

.poster[data-theme="blue-big-fish"] .portrait-field img.art:not([src]),
.poster[data-theme="blue-big-fish"] .portrait-field img.art[src=""] {
  opacity:0;
}

@keyframes fish-report-portrait {
  0%,100% { transform:scaleY(1); }
  50% { transform:scaleY(.99); }
}
@keyframes fish-metric-in {
  from { opacity:0;transform:translateY(6px); }
  to { opacity:1;transform:translateY(0); }
}

/* Background — three-layer cross-hatch + sun accent */
.fish-poster {
  background-color:#dff0fb;
  background-image:
    radial-gradient(circle at 82% 17%,rgba(255,210,74,.32) 0 2.5px,transparent 3px),
    repeating-linear-gradient(112deg,transparent 0 33px,rgba(7,87,207,.042) 33px 34px,transparent 34px 66px),
    repeating-linear-gradient(22deg,transparent 0 54px,rgba(7,87,207,.022) 54px 55px,transparent 55px 110px);
}

/* Horizontal grid lines + side fade */
.fish-poster::before {
  position:absolute;z-index:0;inset:0;content:"";pointer-events:none;
  background:
    linear-gradient(90deg,rgba(255,255,255,.28),transparent 18% 82%,rgba(7,87,207,.06)),
    repeating-linear-gradient(0deg,transparent 0 22px,rgba(7,87,207,.038) 22px 23px);
  mix-blend-mode:multiply;opacity:.62;
}

/* Animated decorative circle */
.fish-poster::after {
  position:absolute;z-index:0;right:-7%;top:5.5%;width:46%;aspect-ratio:1;content:"";pointer-events:none;
  border:1.5px solid rgba(7,87,207,.2);border-radius:50%;
  box-shadow:0 0 0 14px rgba(72,191,233,.055),0 0 0 34px rgba(7,87,207,.045),0 0 0 66px rgba(7,87,207,.022);
}

.poster[data-theme="blue-big-fish"]:before {
  content:none;
}
.poster[data-theme="blue-big-fish"]:after { content:none; }
.poster[data-theme="blue-big-fish"]>.current,
.poster[data-theme="blue-big-fish"]>.ripple,
.poster[data-theme="blue-big-fish"]>.light,
.poster[data-theme="blue-big-fish"]>.spark,
.poster[data-theme="blue-big-fish"]>.bubbles,
.poster[data-theme="blue-big-fish"]>.whale-school { display:none; }

/* Art image */
.fish-poster .fish-poster__art {
  filter:saturate(1.07) contrast(1.09) brightness(.985);
}
/* Kicker label */
.poster[data-theme="blue-big-fish"] .kicker {
  font-size:.875rem;letter-spacing:0;text-transform:uppercase;
  color:#46647d;background:none;padding:0;transform:none;
  display:flex;align-items:center;gap:.65rem;
}
.poster[data-theme="blue-big-fish"] .kicker:before { content:'';width:1.5rem;height:.35rem;background:#ffd24a; }

/* Title */
.poster[data-theme="blue-big-fish"] .title {
  color:#0757cf;margin:1rem 0 0;text-wrap:initial;
}
.poster[data-theme="blue-big-fish"] .task { position:relative;min-width:0;color:#fff;font-weight:600;max-width:52rem;margin:0;padding-left:1rem;border-left:4px solid #ffd24a; }
.poster[data-theme="blue-big-fish"] .task:before { content:'';position:absolute;left:-12px;top:.5em;width:8px;height:12px;background:#ffd24a;clip-path:polygon(100% 0,100% 100%,0 50%); }

/* Verified badge — semantic color per status */
.poster[data-theme="blue-big-fish"] .verified {
  width:fit-content;max-width:100%;overflow-wrap:anywhere;
  border:1.5px solid transparent;padding:.32rem .72rem;border-radius:2px;
}
.poster[data-theme="blue-big-fish"] .verified[data-status="completed"],
.poster[data-theme="blue-big-fish"] .verified[data-status="passed"] {
  color:#0757cf;background:#fff;border-color:#bddcf3;
}
.poster[data-theme="blue-big-fish"] .verified[data-status="partial"] {
  color:#7a4e00;background:rgba(212,147,0,.08);border-color:rgba(212,147,0,.32);
}
.poster[data-theme="blue-big-fish"] .verified[data-status="failed"] {
  color:#9b1c35;background:rgba(155,28,53,.07);border-color:rgba(155,28,53,.28);
}
.poster[data-theme="blue-big-fish"][data-status="partial"] .verified {
  color:#7a4e00;background:#fff4cc;border-color:#b58c2c;box-shadow:none;
}
.poster[data-theme="blue-big-fish"][data-status="failed"] .verified {
  color:#9b1c35;background:#fff0f3;border-color:#bc6a7a;box-shadow:none;
}

/* One continuous route anchors the character and report in the same space. */
.poster[data-theme="blue-big-fish"] .current-route { position:relative;min-height:0;padding:1.25rem 0;margin-bottom:2rem;border-top:0;overflow:visible; }
.poster[data-theme="blue-big-fish"] .current-route header { align-items:center; }
.poster[data-theme="blue-big-fish"] .current-route header small { font-size:.8125rem;font-weight:500;color:#46647d; }
.poster[data-theme="blue-big-fish"] .current-route header b { font-size:1.125rem; }
.poster[data-theme="blue-big-fish"] .route-swell { display:none; }
.poster[data-theme="blue-big-fish"] .route-nodes {
  min-height:0;padding:.9rem 0 0;gap:1.5rem;grid-template-columns:repeat(5,minmax(0,1fr));
}
.poster[data-theme="blue-big-fish"] .route-nodes span {
  display:flex;align-items:center;gap:.65rem;min-height:2.5rem;padding:0;
  border:0;background:transparent;transform:none;box-shadow:none;backdrop-filter:none;
}
.poster[data-theme="blue-big-fish"] .route-nodes a {
  display:flex;align-items:center;gap:.65rem;min-height:48px;width:100%;min-width:0;
  padding:.45rem .5rem;color:#0757cf;text-decoration:none;border-bottom:2px solid #bddcf3;
  transition:background .18s ease,border-color .18s ease;
}
.poster[data-theme="blue-big-fish"] .route-nodes a:hover { background:#fff1b5;border-color:#0757cf; }
.poster[data-theme="blue-big-fish"] .route-nodes a:focus-visible { outline:3px solid #0757cf;outline-offset:3px;background:#fff1b5; }
.poster[data-theme="blue-big-fish"] .route-nodes a b { transition:transform .18s ease; }
.poster[data-theme="blue-big-fish"] .route-nodes a:hover b { transform:translateY(-2px); }
.poster[data-theme="blue-big-fish"] .route-nodes span b {
  color:#0757cf;background:#fff;flex:0 0 2rem;width:2rem;height:2rem;font-size:.875rem;
}
.poster[data-theme="blue-big-fish"] .route-nodes span:last-child b { color:#0757cf;background:#fff;border-color:#0757cf; }
.poster[data-theme="blue-big-fish"] .route-nodes span em { font-size:1rem;line-height:1.4;overflow-wrap:anywhere; }
.poster[data-theme="blue-big-fish"] .route-nodes span:before,
.poster[data-theme="blue-big-fish"] .route-nodes span:after { content:none; }

/* The real metrics sit alongside the task, not in a separate character panel. */
.poster[data-theme="blue-big-fish"] .metrics {
  position:relative;isolation:isolate;grid-area:metrics;
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;
  min-height:0;margin:0;padding:1.25rem 0 0;align-items:center;align-self:stretch;border-top:1px solid #80aff1;
}
.poster[data-theme="blue-big-fish"] .metrics:before { content:none; }
.poster[data-theme="blue-big-fish"] .metric {
  display:grid;align-content:start;gap:.4rem;padding:0 1.2rem;background:none;
  border:0;border-left:1px solid #80aff1;box-shadow:none;backdrop-filter:none;
  animation:fish-metric-in .4s cubic-bezier(.16,1,.3,1) both;
}
.poster[data-theme="blue-big-fish"] .metric:first-child { padding-left:0;border-left:0; }
.poster[data-theme="blue-big-fish"] .metric:before,
.poster[data-theme="blue-big-fish"] .metric:after { content:none; }
.poster[data-theme="blue-big-fish"] .metric:hover { transform:none;background:none;box-shadow:none; }
.poster[data-theme="blue-big-fish"] .metric small { color:#e6f4ff;font-size:.8125rem; }
.poster[data-theme="blue-big-fish"] .metric:nth-child(2){animation-delay:.06s}
.poster[data-theme="blue-big-fish"] .metric:nth-child(3){animation-delay:.12s}
.poster[data-theme="blue-big-fish"] .metric b {
  color:#fff;font-size:2.25rem;line-height:1;
}
.poster[data-theme="blue-big-fish"] .metric[data-metric-state="unavailable"] b,
.poster[data-theme="blue-big-fish"] .metric[data-metric-state="unconfigured"] b {
  color:#d8eeff;
}
.poster[data-theme="blue-big-fish"] .metric[data-metric-state="failed"] b { color:#ffe0e6; }

/* Manifest blocks */
.poster[data-theme="blue-big-fish"] .manifest-block ul { align-content:start; }
.poster[data-theme="blue-big-fish"] .manifest-output__path {
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem 1rem;
}
.poster[data-theme="blue-big-fish"] .manifest-output__path em { display:none; }
.poster[data-theme="blue-big-fish"] .manifest-output__path span:not(:last-child):after { display:none; }
.poster[data-theme="blue-big-fish"] .manifest-output__path span { display:grid;grid-template-columns:1fr;gap:.2rem; }
.poster[data-theme="blue-big-fish"] .manifest-output__path strong { white-space:normal;overflow-wrap:anywhere; }
.poster[data-theme="blue-big-fish"] .title { font-size:64px;line-height:1.08; }
.poster[data-theme="blue-big-fish"] .footer { margin-top:1.5rem; }
.poster[data-theme="blue-big-fish"] .delivery-manifest {
  border:0;border-radius:0;box-shadow:none;background:none;padding:0;margin:0;
}
.poster[data-theme="blue-big-fish"] .delivery-manifest:before,
.poster[data-theme="blue-big-fish"] .delivery-manifest:after { content:none; }
.poster[data-theme="blue-big-fish"] .manifest-grid { padding:1.5rem 0;gap:1.5rem; }
.poster[data-theme="blue-big-fish"] .manifest-block li { padding:.65rem 0; }
.poster[data-theme="blue-big-fish"] .manifest-output { box-shadow:none;border:0;border-left:4px solid #ffd24a;padding:1rem;background:#e9f4ff; }
.poster[data-theme="blue-big-fish"] .fish-detail-ledger { border:0;background:transparent;box-shadow:none;padding:1.5rem 0 0;margin-top:1.5rem; }
.poster[data-theme="blue-big-fish"] .fish-detail-ledger>header { padding:.85rem 1rem; }
.poster[data-theme="blue-big-fish"] [id],.poster[data-theme="blue-big-fish"] ~ .evidence-page { scroll-margin-top:1.5rem; }
.poster[data-theme="blue-big-fish"] [id]:target { outline:3px solid #e1b200;outline-offset:8px; }
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status] {
  display:grid;grid-template-columns:minmax(0,1fr);gap:.3rem;align-content:start;
}
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status]>span,
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status]>b {
  min-width:0;overflow:visible;white-space:normal;overflow-wrap:anywhere;text-overflow:clip;
}
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status="failed"]>b { color:#a12643!important; }
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status="partial"]>b { color:#805900!important; }
.poster[data-theme="blue-big-fish"] .manifest-block li[data-status="skipped"]>b { color:#496079!important; }

/* Privacy line */
.poster[data-theme="blue-big-fish"] .manifest-output__privacy { color:#075e59; }

/* Fish detail comparison — clean header */
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header { background:transparent;padding:0; }
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header b { color:#0757cf; }
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header small { display:block;color:#2865ad; }

/* Evidence keeps consistent slots regardless of capture count or orientation. */
.poster[data-theme="blue-big-fish"] ~ .evidence-page {
  min-height:0;background:#eaf4ff;color:#0c1a3d;padding:3rem max(1rem,calc((100% - 80rem)/2));
}
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__frame { border:0;padding:0;background:none;color:#0c1a3d; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__frame:after { content:none; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head { border-bottom:3px solid #0757cf;padding-bottom:1rem;gap:1rem; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .fish-evidence-title { position:relative;min-height:90px;padding:2.5rem 0 0 148px; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .fish-evidence-companion { position:absolute;width:140px;height:140px;bottom:-18px;left:0;object-fit:contain; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head h2 { color:#0757cf;font-size:2rem;line-height:1.15; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head small { color:#46647d; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head>span { color:#0757cf;background:#fff0a8;padding:.45rem .65rem; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .shot { background:#fff;border:1px solid #adc9df; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page figcaption { color:#244561; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page figcaption b { color:#0757cf; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__footer { color:#46647d; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__grid {
  grid-template-columns:repeat(2,minmax(0,1fr));
}
.poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__item { grid-column:auto; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .shot { position:relative;aspect-ratio:16/10; }
.poster[data-theme="blue-big-fish"] ~ .evidence-page .shot img {
  position:absolute;inset:0;width:100%;height:100%;max-height:none;object-fit:contain;
}
.poster[data-theme="blue-big-fish"] ~ .evidence-page figcaption span {
  white-space:normal;overflow-wrap:anywhere;
}
@media(max-width:35rem) {
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__grid { grid-template-columns:minmax(0,1fr); }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .shot { aspect-ratio:auto; }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .shot img { position:static;height:auto; }
}

@media(min-width:56.25rem) and (max-width:75rem) {
  .poster[data-theme="blue-big-fish"] .poster-layout { width:calc(100% - 4rem); }
  .poster[data-theme="blue-big-fish"] .title { font-size:48px; }
}

/* Responsive */
@media(max-width:56.249rem) {
  .poster[data-theme="blue-big-fish"] .poster-layout {
    width:calc(100% - 2rem);padding:0 0 1rem;
    grid-template-columns:minmax(0,1fr);
    grid-template-areas:'copy' 'route' 'evidence' 'footer';
    grid-template-rows:auto auto auto auto;gap:0;
  }
  .poster[data-theme="blue-big-fish"] .copy { padding:1.5rem 0 0; }
  .poster[data-theme="blue-big-fish"] .fish-brief { grid-template-columns:200px minmax(0,1fr);gap:1rem 1.5rem; }
  .poster[data-theme="blue-big-fish"] .fish-brief__message { flex-direction:column;align-items:flex-start;gap:1rem; }
  .poster[data-theme="blue-big-fish"] .fish-status-wrap { max-width:100%; }
  .poster[data-theme="blue-big-fish"] .metric { padding:0 .75rem; }
  .poster[data-theme="blue-big-fish"] .metric b { font-size:1.75rem; }
  .poster[data-theme="blue-big-fish"] .current-route header { align-items:flex-start;gap:.3rem; }
  .poster[data-theme="blue-big-fish"] .route-nodes { border:0;gap:.4rem; }
  .poster[data-theme="blue-big-fish"] .route-nodes span { flex-direction:column;align-items:flex-start;gap:.4rem; }
  .poster[data-theme="blue-big-fish"] .route-nodes span em { font-size:.8125rem; }
  .poster[data-theme="blue-big-fish"] .title { font-size:36px; }
  .poster[data-theme="blue-big-fish"] .delivery-manifest { padding:0; }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head { align-items:stretch; }
}
@media(max-width:560px) {
  .poster[data-theme="blue-big-fish"] .fish-brief { grid-template-columns:116px minmax(0,1fr);grid-template-areas:'portrait message' 'metrics metrics';gap:1.25rem .5rem;padding:1.25rem 0;margin-top:1.5rem; }
  .poster[data-theme="blue-big-fish"] .portrait-field { min-height:140px; }
  .poster[data-theme="blue-big-fish"] .fish-companion { width:132px;max-width:none;left:-8px;bottom:-1.25rem; }
  .poster[data-theme="blue-big-fish"] .fish-companion__cue { left:0;max-width:100%;font-size:.75rem;padding:.35rem .45rem; }
  .poster[data-theme="blue-big-fish"] .task { font-size:1rem;padding-left:.75rem;border-left-width:3px; }
  .poster[data-theme="blue-big-fish"] .metrics { padding-top:1rem; }
  .poster[data-theme="blue-big-fish"] .metric { padding:0 .75rem;gap:.4rem; }
  .poster[data-theme="blue-big-fish"] .metric b { font-size:1.5rem; }
  .poster[data-theme="blue-big-fish"] .metric small { font-size:.75rem;line-height:1.4; }
  .poster[data-theme="blue-big-fish"] .route-nodes { grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem 1rem; }
  .poster[data-theme="blue-big-fish"] .route-nodes span { flex-direction:row;align-items:center; }
  .poster[data-theme="blue-big-fish"] .route-nodes span:last-child { grid-column:1/-1; }
  .poster[data-theme="blue-big-fish"] .route-nodes a { padding:.4rem .25rem; }
  .poster[data-theme="blue-big-fish"] .fish-status-wrap .verified { font-size:.8125rem;padding:.5rem; }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .fish-evidence-title { padding-left:108px; }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .fish-evidence-companion { width:100px;height:100px; }
  .poster[data-theme="blue-big-fish"] ~ .evidence-page .evidence-page__head h2 { font-size:1.5rem; }
  .fish-poster .fish-poster__portrait { top:27%;right:-18%;width:108%;height:76%;opacity:.26; }
  .fish-poster .fish-poster__pop.pop-one { left:auto;width:max-content;max-width:calc(100% - 2rem); }
  .poster[data-theme="blue-big-fish"]::after { width:70%;right:-14%;top:3%;opacity:.7; }
}

/* Reduced motion */
@media(prefers-reduced-motion:reduce) {
  html:has(.poster[data-theme="blue-big-fish"]) { scroll-behavior:auto; }
  .poster[data-theme="blue-big-fish"]::after,
  .poster[data-theme="blue-big-fish"] *,
  .poster[data-theme="blue-big-fish"] *::before,
  .poster[data-theme="blue-big-fish"] *::after { animation:none!important;transition:none!important; }
  .poster[data-theme="blue-big-fish"] .portrait-field .art { transform:none; }
}

/* Explicit per-report opt-in can enable motion without changing OS preferences. */
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .fish-companion__body {
  transform:translate3d(var(--fish-look-x,0px),var(--fish-look-y,0px),0) rotate(var(--fish-look-turn,0deg));
}
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .portrait-field .art,
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .portrait-field .art-response { transition:opacity .18s ease!important; }
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .fish-companion__body .art { animation:fish-report-portrait 5s ease-in-out infinite!important; }
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .fish-companion__cue { transition:opacity .18s ease,translate .25s ease!important;translate:0 4px; }
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .fish-brief[data-fish-attention] .fish-companion__cue { translate:0 0; }
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .task:before { transition:transform .25s ease!important; }
.poster[data-theme="blue-big-fish"][data-fish-motion="full"] .fish-brief[data-fish-attention="task"] .task:before { transform:translateX(-3px); }
`;
