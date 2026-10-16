// Shared by the React preview and the self-contained npm report.
export const fishVisualCss = `
.fish-poster,.poster[data-theme="blue-big-fish"] {
  background-color:#e8f5ff;
  background-image:radial-gradient(circle at 82% 19%,rgba(255,210,74,.22) 0 2px,transparent 2.5px),repeating-linear-gradient(112deg,transparent 0 34px,rgba(7,87,207,.045) 34px 35px,transparent 35px 70px);
}
.fish-poster::before,.poster[data-theme="blue-big-fish"]::before {
  position:absolute;z-index:0;inset:0;content:"";pointer-events:none;
  background:linear-gradient(90deg,rgba(255,255,255,.2),transparent 22% 78%,rgba(7,87,207,.08)),repeating-linear-gradient(0deg,transparent 0 23px,rgba(7,87,207,.045) 23px 24px);
  mix-blend-mode:multiply;opacity:.7;
}
.fish-poster::after,.poster[data-theme="blue-big-fish"]::after {
  position:absolute;z-index:0;right:-9%;top:7%;width:48%;aspect-ratio:1;content:"";pointer-events:none;
  border:2px solid rgba(7,87,207,.26);border-radius:50%;
  box-shadow:0 0 0 18px rgba(72,191,233,.08),0 0 0 42px rgba(7,87,207,.06);transform:rotate(-14deg);
}
.fish-poster .fish-poster__art,.poster[data-theme="blue-big-fish"] .art {
  filter:saturate(1.04) contrast(1.1) brightness(.99);
}
.poster[data-theme="blue-big-fish"] .art {
  object-fit:contain;object-position:center bottom;opacity:.9;
  animation:fish-report-portrait 10s cubic-bezier(.22,1,.36,1) infinite alternate;
}
.poster[data-theme="blue-big-fish"] .verified {
  width:fit-content;max-width:100%;overflow-wrap:anywhere;
}
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
.poster[data-theme="blue-big-fish"] .manifest-output__privacy { color:#075e59; }
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header { background:transparent;padding:0; }
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header b { color:#0757cf; }
.poster[data-theme="blue-big-fish"] .fish-detail-comparison header small { display:block;color:#2865ad; }
@keyframes fish-report-portrait {
  from { transform:translate3d(0,0,0) scale(.97); }
  to { transform:translate3d(0,-.35rem,0) scale(.98); }
}
@media(max-width:56.249rem) {
  .poster[data-theme="blue-big-fish"] .poster-layout {
    padding-top:1.5rem;grid-template-rows:auto auto auto auto auto auto;
  }
}
@media(max-width:560px) {
  .fish-poster .fish-poster__portrait { top:27%;right:-18%;width:108%;height:76%;opacity:.26; }
  .fish-poster .fish-poster__pop.pop-one { left:auto;width:max-content;max-width:calc(100% - 2rem); }
}
@media(prefers-reduced-motion:reduce) {
  .poster[data-theme="blue-big-fish"] .art { animation:none;transform:none; }
}
`;
