export const dijiangReadoutMarkup = '<div class="field-readout" aria-label="交付中继状态"><div class="field-readout__head"><span>交付中继</span><b>D-0017</b></div><div class="field-readout__grid"><span><small>节点链路</small><strong>05 / 04</strong></span><span><small>输出状态</small><strong>LOCAL / VERIFIED</strong></span><span><small>上传策略</small><strong>LOCAL ONLY</strong></span></div></div>';

export const dijiangHardeningCss = `
.poster,
.field-blueprint {
  overflow: clip;
}

.field-blueprint__svg {
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.dijiang-poster {
  --ef-signal: #fff44f;
  --ef-ink: #090b0d;
  --ef-panel: #111519;
  --ef-muted: #828b91;
  --ef-paper: #f1f2ee;
  color: #eef0ec;
  background: var(--ef-ink);
  box-shadow: inset 0 0 0 0.16rem var(--ef-signal);
}

.dijiang-poster::before {
  content: "";
  position: absolute;
  z-index: 2;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, transparent 0 3px, rgba(255, 255, 255, 0.018) 3px 4px),
    linear-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.026) 1px, transparent 1px);
  background-size: auto, 3rem 3rem, 3rem 3rem;
  pointer-events: none;
}

.dijiang-poster::after {
  content: "LOCAL EVIDENCE NODE // D-0017 // SYSTEM ONLINE";
  position: absolute;
  z-index: 11;
  top: 34%;
  right: 0.55rem;
  color: #687078;
  font: 800 0.55rem/1 "Cascadia Mono", "Microsoft YaHei UI", monospace;
  writing-mode: vertical-rl;
  pointer-events: none;
}

.field-topband {
  z-index: 1;
  height: 4.5%;
  min-height: 2.5rem;
  background: #090b0d;
  border-bottom: 1px solid #424a50;
  clip-path: none;
}

.field-topband::after {
  content: "";
  position: absolute;
  right: 4.5%;
  bottom: -1px;
  width: 22%;
  height: 0.18rem;
  background: linear-gradient(90deg, var(--ef-signal) 0 68%, #43d9e7 68% 84%, #f46a8c 84% 100%);
}

.field-sheet {
  z-index: 1;
  inset: 4.5% 0 0;
  background-color: var(--ef-panel);
  background-image:
    repeating-radial-gradient(ellipse at 72% 48%, transparent 0 1.2rem, rgba(155, 167, 174, 0.13) 1.26rem 1.32rem, transparent 1.38rem 2.38rem),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: auto, 3rem 3rem, 3rem 3rem;
  border: 0;
  clip-path: none;
}

.field-sheet::after {
  right: 0;
  width: 43%;
  background: rgba(0, 0, 0, 0.18);
  clip-path: polygon(28% 0, 100% 0, 100% 100%, 0 100%);
}

.field-contours {
  z-index: 3;
  opacity: 0.32;
  mix-blend-mode: screen;
}

.field-contours path {
  stroke: #778187;
  stroke-width: 1.25;
  stroke-dasharray: 2 7;
  stroke-linecap: round;
}

.field-topmark {
  z-index: 2;
  top: -2.8%;
  right: 2%;
  opacity: 0.075;
}

.field-topmark text {
  fill: var(--ef-signal);
  stroke: var(--ef-signal);
}

.field-topmark .field-slashed-rail {
  stroke: #cad0cc;
}

.field-topmark .field-slashed-rail--accent {
  stroke: var(--ef-signal);
}

.field-copy-panel {
  z-index: 5;
  top: 9.5%;
  left: 3.5%;
  width: min(43vw, 42rem);
  height: 58%;
  background-color: var(--ef-paper);
  background-image:
    repeating-radial-gradient(ellipse at 32% 48%, transparent 0 1.15rem, rgba(17, 21, 25, 0.11) 1.2rem 1.27rem, transparent 1.34rem 2.35rem),
    linear-gradient(rgba(17, 21, 25, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 21, 25, 0.045) 1px, transparent 1px);
  background-size: auto, 2.6rem 2.6rem, 2.6rem 2.6rem;
  border-left: 0.28rem solid var(--ef-signal);
  box-shadow: 0.55rem 0.55rem 0 rgba(0, 0, 0, 0.28);
  clip-path: none;
}

.mast {
  z-index: 9;
  top: 1.25%;
  left: 3.5%;
  right: 3.5%;
  padding-top: 0;
  color: #d9ddda;
  border-top: 0;
  font-size: clamp(0.62rem, 0.72vw, 0.76rem);
}

.mast::after {
  content: "";
  flex: 1;
  height: 1px;
  margin-inline: 1rem;
  background: repeating-linear-gradient(90deg, #737b80 0 1px, transparent 1px 0.65rem);
  order: 1;
}

.mast span:first-child { order: 0; }
.mast span:last-child { order: 2; color: #8a9297; }
.mast span:first-child::before { color: var(--ef-ink); background: var(--ef-signal); }

.copy {
  z-index: 7;
  top: 16%;
  left: 5.1%;
  width: min(38vw, 38rem);
}

.kicker { color: var(--ef-ink); background: var(--ef-signal); }

.title {
  color: #111519;
  font-size: clamp(3.7rem, 6.3vw, 6.9rem);
  line-height: 0.8;
}

.task { max-width: 34rem; color: #333a3e; }

.verified {
  color: #edf0ec;
  background: #111519;
  border-color: #111519;
  box-shadow: 0.22rem 0.22rem 0 var(--ef-signal);
}

.field-calibration { opacity: 0.92; }

.stamp {
  z-index: 10;
  top: 8.4%;
  right: 3.5%;
  color: var(--ef-ink);
  background: var(--ef-signal);
  border-color: var(--ef-signal);
  box-shadow: 0.24rem 0.24rem 0 #343b40;
}

.field-safety-slab {
  z-index: 4;
  left: 47%;
  top: 30%;
  width: 40%;
  height: 6.5%;
  background: var(--ef-signal);
  opacity: 0.88;
}

.field-blueprint {
  z-index: 5;
  top: 10.5%;
  right: 3.5%;
  bottom: 20%;
  width: min(51vw, 50rem);
  background-color: #0d1114;
  background-image:
    linear-gradient(rgba(13, 17, 20, 0.36), rgba(13, 17, 20, 0.58)),
    url("/dijiang-survey-surface.webp");
  background-position: center;
  background-size: auto, cover;
  border: 1px solid #485158;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025), 0.42rem 0.42rem 0 rgba(0, 0, 0, 0.38);
  clip-path: none;
}

.field-blueprint::before {
  content: "DIJIANG / INDUSTRIAL RELAY / D-0017";
  position: absolute;
  z-index: 7;
  top: 0.7rem;
  left: 0.8rem;
  color: #747e84;
  font: 800 0.58rem/1 "Cascadia Mono", "Microsoft YaHei UI", monospace;
}

.field-blueprint__grid {
  background-image:
    linear-gradient(rgba(168, 179, 185, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 179, 185, 0.11) 1px, transparent 1px),
    repeating-linear-gradient(0deg, transparent 0 1.35rem, rgba(168, 179, 185, 0.045) 1.4rem 1.44rem),
    repeating-linear-gradient(90deg, transparent 0 1.35rem, rgba(168, 179, 185, 0.045) 1.4rem 1.44rem);
  background-size: 3rem 3rem, 3rem 3rem, auto, auto;
  opacity: 0.8;
}

.field-blueprint__svg .bp-contour {
  stroke: #89939a;
  stroke-width: 1.25;
  stroke-dasharray: 2 7;
  stroke-opacity: 0.48;
}

.field-blueprint__svg .bp-shell { fill: rgba(15, 19, 22, 0.86); stroke: #c5cbc8; stroke-width: 2; }
.field-blueprint__svg .bp-beam,
.field-blueprint__svg .bp-rail { stroke: #aeb6b3; }
.field-blueprint__svg .bp-core { fill: #31383d; opacity: 1; }
.field-blueprint__svg .bp-arm { stroke: #8d969a; stroke-width: 10; opacity: 0.78; }
.field-blueprint__svg .bp-module { fill: #151a1e; stroke: #c7cdca; stroke-width: 2; }
.field-blueprint__svg .bp-module--two,
.field-blueprint__svg .bp-node { fill: var(--ef-signal); stroke: var(--ef-signal); }
.field-blueprint__slash {
  z-index: 1;
  color: #c9cfcc;
  opacity: 0.075;
  pointer-events: none;
}

.field-blueprint__svg .bp-mapline {
  fill: none;
  stroke: #687379;
  stroke-width: 1.5;
  stroke-dasharray: 2 8;
  opacity: 0.72;
}

.field-blueprint__svg .bp-link {
  fill: none;
  stroke: #aeb6b3;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 10 8;
  animation: dijiang-topology-flow 9s linear infinite;
}

.field-blueprint__svg .bp-link--secondary {
  stroke: #69757a;
  stroke-width: 1.5;
  stroke-dasharray: 2 8;
  animation-delay: -3s;
}

.field-blueprint__svg .bp-crosshair {
  fill: none;
  stroke: #69757a;
  stroke-width: 1;
  stroke-dasharray: 3 7;
}

.field-blueprint__svg .bp-stage circle {
  fill: #151a1e;
  stroke: #c7cdca;
  stroke-width: 2;
}

.field-blueprint__svg .bp-stage--five circle {
  fill: var(--ef-signal);
  stroke: var(--ef-signal);
}

.field-blueprint__svg .bp-stage__index,
.field-blueprint__svg .bp-stage__label,
.field-blueprint__svg .bp-stage__code,
.field-blueprint__svg .bp-hub__code,
.field-blueprint__svg .bp-hub__label,
.field-blueprint__svg .bp-hub__meta,
.field-blueprint__svg .bp-readout {
  text-anchor: middle;
  font-family: "Cascadia Mono", "Microsoft YaHei UI", monospace;
}

.field-blueprint__svg .bp-stage__index {
  fill: #f0f2ee;
  font-size: 13px;
  font-weight: 900;
}

.field-blueprint__svg .bp-stage--five .bp-stage__index {
  fill: var(--ef-ink);
}

.field-blueprint__svg .bp-stage__label {
  fill: #e8ebe7;
  font-size: 15px;
  font-weight: 900;
}

.field-blueprint__svg .bp-stage__code,
.field-blueprint__svg .bp-readout {
  fill: #7f8a90;
  font-size: 9px;
  letter-spacing: 1px;
}

.field-blueprint__svg .bp-stage--five .bp-stage__label {
  fill: var(--ef-signal);
}

.field-blueprint__svg .bp-stage__label,
.field-blueprint__svg .bp-stage__code {
  paint-order: stroke fill;
  stroke: #0d1114;
  stroke-linejoin: round;
}

.field-blueprint__svg .bp-stage__label { stroke-width: 3px; }
.field-blueprint__svg .bp-stage__code { stroke-width: 2px; }

.field-blueprint__svg .bp-hub {
  fill: #101519;
  stroke: #d1d7d3;
  stroke-width: 2;
}

.field-blueprint__svg .bp-hub__core {
  fill: #30383d;
  stroke: var(--ef-signal);
  stroke-width: 2;
}

.field-blueprint__svg .bp-hub__rail {
  fill: none;
  stroke: #7f8a90;
  stroke-width: 1;
}

.field-blueprint__svg .bp-hub__code {
  fill: var(--ef-signal);
  font-size: 11px;
  font-weight: 900;
}

.field-blueprint__svg .bp-hub__label {
  fill: #f0f2ee;
  font-size: 11px;
  font-weight: 900;
}

.field-blueprint__svg .bp-hub__meta {
  fill: #8e999e;
  font-size: 8px;
  letter-spacing: 1px;
}

.field-blueprint__svg .bp-readout {
  text-anchor: start;
}

.field-blueprint__svg .bp-readout--right {
  text-anchor: end;
}

@keyframes dijiang-topology-flow {
  to { stroke-dashoffset: -144; }
}

.field-blueprint__tag {
  z-index: 8;
  bottom: clamp(4.65rem, 8.8vh, 6.2rem);
  color: var(--ef-ink);
  background: var(--ef-signal);
  box-shadow: 0.2rem 0.2rem 0 #4b5358;
}

.field-blueprint__safety {
  z-index: 1;
  top: auto;
  left: 1rem;
  right: 1rem;
  bottom: 1.1rem;
  width: auto;
  height: 2px;
  background: var(--ef-signal);
  clip-path: none;
  opacity: 0.55;
}
.field-blueprint__scan { z-index: 1; background: var(--ef-signal); box-shadow: 0 0 0.65rem rgba(255, 244, 79, 0.62); }

.field-readout {
  position: absolute;
  z-index: 8;
  top: 51.5%;
  left: 5.1%;
  width: min(38vw, 38rem);
  padding: 0.72rem 0.8rem 0.58rem;
  color: #20272b;
  border-top: 2px solid #111519;
  border-bottom: 1px solid rgba(17, 21, 25, 0.28);
  background: rgba(241, 242, 238, 0.72);
}

.field-readout__head,
.field-readout__grid,
.field-readout__grid span {
  min-width: 0;
}

.field-readout__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.52rem;
}

.field-readout__head span {
  color: #111519;
  font-size: clamp(0.88rem, 0.98vw, 1.04rem);
  font-weight: 900;
}

.field-readout__head b {
  color: #59636a;
  font: 900 clamp(0.68rem, 0.75vw, 0.8rem) "Cascadia Mono", "Microsoft YaHei UI", monospace;
  white-space: nowrap;
}

.field-readout__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.72rem;
}

.field-readout__grid span {
  display: grid;
  gap: 0.18rem;
  padding-left: 0.58rem;
  border-left: 2px solid #c5cbca;
}

.field-readout__grid span:first-child { border-left-color: var(--ef-signal); }
.field-readout__grid small { color: #647076; font: 800 clamp(0.62rem, 0.7vw, 0.72rem) "Cascadia Mono", "Microsoft YaHei UI", monospace; }
.field-readout__grid strong { color: #111519; font: 900 clamp(0.72rem, 0.82vw, 0.86rem) "Cascadia Mono", "Microsoft YaHei UI", monospace; overflow-wrap: anywhere; }

.metrics {
  z-index: 9;
  left: 5.1%;
  bottom: 16.2%;
  width: min(42vw, 39rem);
  color: #edf0ec;
  background: #0a0d0f;
  border: 1px solid #434b50;
  border-top: 0.3rem solid var(--ef-signal);
  box-shadow: 0.32rem 0.32rem 0 rgba(0, 0, 0, 0.28);
}

.metrics small { color: #9ca5a9; }

.rail {
  z-index: 10;
  left: 3.5%;
  right: 3.5%;
  bottom: 4.8%;
  color: #e8ebe7;
  background: #080a0c;
  border-top: 1px solid #4a5257;
  border-bottom: 1px solid #282e32;
}

.rail::before {
  content: "DSH // DELIVERY PIPELINE";
  position: absolute;
  right: 0.75rem;
  top: -1.2rem;
  color: #666f74;
  font: 800 0.54rem/1 "Cascadia Mono", "Microsoft YaHei UI", monospace;
}

.rail span { border-right-color: #30363a; }
.rail span:last-child { color: var(--ef-ink); background: var(--ef-signal); }
.rail::after { background: var(--ef-signal); }
.footer { left: 3.5%; bottom: 1.45%; color: #778086; }

.loader.loader--field .field-loader-topband {
  height: 3.25rem;
  min-height: 0;
  background: #080a0c;
  border-bottom: 1px solid #434b50;
  clip-path: none;
}

.loader.loader--field .field-loader-sheet {
  top: 3.25rem;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0b0e10;
  background-image:
    repeating-radial-gradient(ellipse at 72% 46%, transparent 0 1.1rem, rgba(132, 145, 135, 0.14) 1.16rem 1.22rem, transparent 1.29rem 2.2rem),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: auto, 3rem 3rem, 3rem 3rem;
  border: 0;
  box-shadow: none;
  clip-path: none;
}

.loader.loader--field .field-loader-contours { opacity: 0.3; }
.loader.loader--field .field-loader-contours path { stroke: #7b858b; stroke-width: 1.15; stroke-dasharray: 2 7; }

@media (max-width: 56.249rem) {
  .dijiang-poster::after,
  .mast::after,
  .rail::before,
  .field-blueprint::before { display: none; }

  .dijiang-poster { height: auto; min-height: max(100svh, 54rem); }
  .field-topband { height: 4.25rem; min-height: 4.25rem; }
  .field-sheet { inset: 4.25rem 0 0; background-size: auto, 2.25rem 2.25rem, 2.25rem 2.25rem; }

  .field-copy-panel {
    top: 8.4%;
    left: 0.8rem;
    right: 0.8rem;
    width: auto;
    height: 35%;
    background-size: auto, 2.1rem 2.1rem, 2.1rem 2.1rem;
    border-left-width: 0.22rem;
  }

  .mast { top: 1.2rem; left: 1rem; right: 1rem; }
  .copy { top: 12.5%; left: 1.35rem; width: calc(100% - 2.7rem); }
  .title { font-size: clamp(2.8rem, 12.5vw, 4.2rem); }
  .stamp { top: 5.2rem; right: 1rem; }

  .field-blueprint {
    top: 43.5%;
    left: 0.8rem;
    right: 0.8rem;
    bottom: 24.5%;
    width: auto;
  }

  .field-blueprint__tag { left: 0.65rem; bottom: 0.65rem; box-shadow: 0.14rem 0.14rem 0 #4b5358; }
  .field-safety-slab { top: 54%; opacity: 0.34; }
  .metrics { left: 1rem; right: 1rem; width: auto; }
  .field-readout { top: 34%; left: 1.35rem; width: calc(100% - 2.7rem); padding: 0.52rem 0.62rem 0.45rem; }
  .field-readout__head { margin-bottom: 0.36rem; }
  .field-readout__grid { gap: 0.45rem; }
  .field-readout__grid span { padding-left: 0.4rem; }
  .field-readout__grid small { font-size: 0.58rem; }
  .field-readout__grid strong { font-size: 0.66rem; }
  .rail { left: 1rem; right: 1rem; }
  .footer { left: 1rem; }
  .loader.loader--field .field-loader-topband { height: 2.8rem; }
  .loader.loader--field .field-loader-sheet { top: 2.8rem; }
}

@media (max-height: 48rem) and (min-width: 56.25rem) {
  .field-copy-panel { top: 7.5%; height: 61%; }
  .copy { top: 13.5%; }
  .field-blueprint { top: 8.5%; }
  .field-blueprint__tag { bottom: clamp(4.5rem, 9vh, 6.5rem); }
}

/* Endfield-style single-focus startup sequence. */
.loader.loader--field {
  --loader-signal: #f3ef18;
  --loader-copy: #f0f2ed;
  --loader-muted: #78817c;
  display: block;
  color: var(--loader-copy);
  background: #080a09;
  animation: dijiang-reference-exit 4.45s cubic-bezier(0.22, 1, 0.36, 1) both !important;
}

.loader.loader--field::before,
.loader.loader--field::after {
  inset: 0;
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  aspect-ratio: auto;
  border: 0;
  border-radius: 0;
  transform: none;
}

.loader.loader--field::before {
  z-index: 40;
  background: #f3f4ef;
  opacity: 0;
  animation: dijiang-calibration-flash 0.42s steps(1, end) both;
}

.loader.loader--field::after {
  z-index: 39;
  background: #050605;
  opacity: 0;
  animation: dijiang-blackout-beat 4.45s linear both;
}

.loader.loader--field .field-loader-slashmark,
.loader.loader--field .field-loader-diagram,
.loader.loader--field .field-loader-scan,
.loader.loader--field .field-loader-stages,
.loader.loader--field .field-loader-anchor,
.loader.loader--field .field-loader-release {
  display: none;
}

.loader.loader--field .field-loader-topband {
  display: block;
  position: absolute;
  z-index: 40;
  inset: -8% auto -8% -14%;
  width: 128%;
  height: auto;
  min-height: 0;
  background: var(--loader-signal);
  border: 0;
  box-shadow: -1.1rem 0 0 #b4b10e, 1.1rem 0 0 rgba(243, 239, 24, 0.2);
  clip-path: polygon(0 0, 92% 0, 100% 100%, 8% 100%);
  transform: translate3d(-112%, 0, 0);
  will-change: transform;
  animation: dijiang-yellow-transfer 4.45s cubic-bezier(0.76, 0, 0.24, 1) both;
}

.loader.loader--field .field-loader-topband::after {
  content: "TRANSFER / D-0017";
  position: absolute;
  right: 8%;
  bottom: 8%;
  color: rgba(8, 10, 9, 0.56);
  font: 900 clamp(0.62rem, 0.78vw, 0.82rem) "Cascadia Mono", "Microsoft YaHei UI", monospace;
  letter-spacing: 0.08em;
}

.loader.loader--field .field-loader-sheet {
  inset: 0;
  padding: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(45, 54, 48, 0.22), transparent 42%),
    #080a09;
  border: 0;
  box-shadow: none;
  clip-path: none;
  animation: none !important;
}

.loader.loader--field .field-loader-sheet::before {
  z-index: 0;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(218, 226, 219, 0.13) 0.045rem, transparent 0.055rem),
    repeating-linear-gradient(0deg, transparent 0 3px, rgba(255, 255, 255, 0.018) 3px 4px);
  background-size: 0.34rem 0.34rem, auto;
  opacity: 0.44;
}

.loader.loader--field .field-loader-sheet::after {
  content: "";
  position: absolute;
  z-index: 1;
  inset: 8% 10%;
  background:
    linear-gradient(90deg, transparent 0 49.9%, rgba(151, 161, 154, 0.14) 50%, transparent 50.1%),
    linear-gradient(transparent 0 49.9%, rgba(151, 161, 154, 0.1) 50%, transparent 50.1%);
  opacity: 0.7;
  pointer-events: none;
}

.loader.loader--field .field-loader-contours {
  z-index: 1;
  opacity: 0.08;
}

.loader.loader--field .field-loader-contours path {
  stroke: #87908b;
  stroke-width: 1;
  stroke-dasharray: 2 12;
  animation-duration: 38s;
}

.loader.loader--field .field-loader-id {
  z-index: 8;
  top: 1.2rem;
  left: clamp(1rem, 4vw, 4rem);
  color: #929b95;
  font-size: clamp(0.56rem, 0.68vw, 0.7rem);
  letter-spacing: 0.08em;
}

.loader.loader--field .field-loader-id::before {
  content: "STARTUP PROCEDURE";
  display: block;
  margin-bottom: 0.18rem;
  color: var(--loader-signal);
}

.loader.loader--field .field-loader-id::after {
  content: "VISUAL ADAPTATION / D-0017";
  display: block;
  color: #59615d;
}

.loader.loader--field .field-loader-instrument {
  z-index: 2;
  top: 42%;
  left: 50%;
  right: auto;
  width: min(64vmin, 45rem);
  max-width: none;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.88) rotate(-9deg);
  animation: dijiang-reference-ring-in 0.82s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both !important;
}

.loader.loader--field .field-loader-instrument .instrument-halo {
  stroke: #818a84;
  stroke-dasharray: 1 13;
  opacity: 0.58;
  animation-duration: 11s;
}

.loader.loader--field .field-loader-instrument .instrument-ring--outer {
  stroke: #a0a8a2;
  stroke-dasharray: 1 10;
  opacity: 0.48;
  animation-duration: 8s;
}

.loader.loader--field .field-loader-instrument .instrument-ring--inner {
  stroke: #59615d;
  stroke-dasharray: 7 10;
  opacity: 0.56;
  animation-duration: 6.5s;
}

.loader.loader--field .field-loader-instrument .instrument-ticks {
  transform-origin: 160px 160px;
  animation: dijiang-reference-tick-spin 14s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-sweep {
  animation-duration: 2.6s;
}

.loader.loader--field .field-loader-instrument .instrument-ring--core,
.loader.loader--field .field-loader-instrument .instrument-sweep,
.loader.loader--field .field-loader-instrument .instrument-node,
.loader.loader--field .field-loader-instrument .instrument-label {
  opacity: 0.34;
}

.loader.loader--field .field-loader-copy {
  z-index: 7;
  top: 48%;
  left: 50%;
  right: auto;
  width: min(82vw, 68rem);
  display: grid;
  justify-items: center;
  gap: clamp(0.42rem, 1vh, 0.72rem);
  text-align: center;
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: dijiang-reference-focal-in 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
}

.loader.loader--field .field-loader-copy::before {
  content: "DIJIANG INDUSTRIES   //   DSH DELIVERY SYSTEM";
  grid-row: 1;
  color: #d7dcd7;
  font: 900 clamp(0.7rem, 0.9vw, 0.9rem) "Cascadia Mono", "Microsoft YaHei UI", monospace;
  letter-spacing: 0.06em;
  white-space: pre-wrap;
}

.loader.loader--field .field-loader-copy strong {
  grid-row: 2;
  max-width: 100%;
  color: var(--loader-signal);
  font-size: clamp(2.6rem, 4.55vw, 4.8rem);
  line-height: 0.86;
  letter-spacing: 0;
  text-transform: uppercase;
  opacity: 1;
  clip-path: none;
  transform: none;
  animation: none !important;
}

.loader.loader--field .field-loader-kicker {
  grid-row: 3;
  padding: 0;
  color: #7c8580;
  background: transparent;
  font-size: clamp(0.58rem, 0.7vw, 0.72rem);
  letter-spacing: 0.08em;
}

.loader.loader--field .field-loader-kicker::after { display: none; }

.loader.loader--field .field-loader-copy::after {
  content: "PROMPT  /  BUILD  /  TEST  /  CAPTURE  /  SHIP";
  grid-row: 4;
  color: #525a56;
  font: 800 clamp(0.54rem, 0.64vw, 0.66rem) "Cascadia Mono", "Microsoft YaHei UI", monospace;
  letter-spacing: 0.08em;
}

.loader.loader--field .field-loader-calibration {
  grid-row: 5;
  width: clamp(5rem, 7vw, 7rem);
  height: 0.14rem;
  margin: 0.2rem 0 0;
}

.loader.loader--field .field-loader-calibration i:first-child { background: var(--loader-signal); }
.loader.loader--field .field-loader-calibration i:nth-child(2) { background: #53d7df; }
.loader.loader--field .field-loader-calibration i:nth-child(3) { background: #df4d82; }

.loader.loader--field .field-loader-readout {
  position: static;
  color: #777f7a;
}

.loader.loader--field .field-loader-readout > b {
  position: absolute;
  z-index: 8;
  top: 3rem;
  left: clamp(1rem, 4vw, 4rem);
  color: var(--loader-signal);
  font-size: clamp(1.6rem, 2.3vw, 2.5rem);
  line-height: 0.9;
}

.loader.loader--field .field-loader-readout > span {
  position: absolute;
  z-index: 8;
  top: 5.5rem;
  left: clamp(1rem, 4vw, 4rem);
  color: #69716c;
  font-size: clamp(0.54rem, 0.65vw, 0.66rem);
  letter-spacing: 0.08em;
}

.loader.loader--field .field-loader-progress {
  position: absolute;
  z-index: 8;
  left: 18%;
  right: 18%;
  bottom: clamp(2.8rem, 6vh, 4.3rem);
  width: auto;
  height: 0.15rem;
  border: 0;
  background: #303632;
  overflow: visible;
}

.loader.loader--field .field-loader-progress::after {
  content: "";
  position: absolute;
  inset: 0 -4.6rem 0 auto;
  width: 4.1rem;
  background: linear-gradient(90deg, var(--loader-signal) 0 52%, #53d7df 52% 76%, #df4d82 76% 100%);
  opacity: 0.9;
}

.loader.loader--field .field-loader-progress em {
  background: var(--loader-signal);
  box-shadow: 0 0 0.5rem rgba(243, 239, 24, 0.42);
}

.loader.loader--field .field-loader-statusbar {
  position: static;
  min-height: 0;
  padding: 0;
  color: var(--loader-copy);
  background: transparent;
  border: 0;
  animation: none !important;
}

.loader.loader--field .field-loader-statusbar::before,
.loader.loader--field .field-loader-statusbar::after {
  position: absolute;
  z-index: 7;
  top: 37%;
  width: min(21vw, 16rem);
  padding-top: 0.45rem;
  color: #8b938e;
  border-top: 1px solid #434a46;
  font: 800 clamp(0.52rem, 0.62vw, 0.64rem) "Cascadia Mono", "Microsoft YaHei UI", monospace;
  letter-spacing: 0.06em;
}

.loader.loader--field .field-loader-statusbar::before {
  content: "01   EVIDENCE / CONNECTED";
  left: 7%;
  text-align: left;
}

.loader.loader--field .field-loader-statusbar::after {
  content: "02   OUTPUT / LOCAL ONLY";
  right: 7%;
  text-align: right;
}

.loader.loader--field .field-loader-status {
  position: absolute;
  z-index: 8;
  right: clamp(1rem, 4vw, 4rem);
  bottom: 1.2rem;
  color: #747d77;
  font-size: clamp(0.54rem, 0.66vw, 0.68rem);
  letter-spacing: 0.06em;
}

@keyframes dijiang-calibration-flash {
  0%, 34% { opacity: 1; }
  35%, 100% { opacity: 0; }
}

@keyframes dijiang-reference-ring-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.88) rotate(-9deg); }
  to { opacity: 0.72; transform: translate(-50%, -50%) scale(1) rotate(0); }
}

@keyframes dijiang-reference-focal-in {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); clip-path: inset(0 52% 0 52%); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); clip-path: inset(0 0 0 0); }
}

@keyframes dijiang-reference-tick-spin {
  to { transform: rotate(360deg); }
}

@keyframes dijiang-yellow-transfer {
  0%, 59% { transform: translate3d(-112%, 0, 0); }
  72% { transform: translate3d(-4%, 0, 0); }
  84%, 100% { transform: translate3d(108%, 0, 0); }
}

@keyframes dijiang-blackout-beat {
  0%, 68% { opacity: 0; }
  72%, 100% { opacity: 1; }
}

@keyframes dijiang-reference-exit {
  0%, 88% { visibility: visible; pointer-events: auto; clip-path: inset(0 0 0 0); }
  100% { visibility: hidden; pointer-events: none; clip-path: inset(0 0 0 100%); }
}

@keyframes dijiang-reference-reduced-exit {
  0%, 84% { opacity: 1; visibility: visible; pointer-events: auto; }
  100% { opacity: 0; visibility: hidden; pointer-events: none; }
}

@media (max-width: 56.249rem) {
  .loader.loader--field .field-loader-sheet { inset: 0; padding: 0; }
  .loader.loader--field .field-loader-instrument { top: 43%; left: 50%; right: auto; width: min(112vw, 35rem); opacity: 0.42; }
  .loader.loader--field .field-loader-copy { top: 48%; left: 50%; right: auto; width: calc(100vw - 2rem); }
  .loader.loader--field .field-loader-copy::before { font-size: 0.62rem; }
  .loader.loader--field .field-loader-copy strong { font-size: clamp(2.15rem, 10.5vw, 3.6rem); overflow-wrap: anywhere; }
  .loader.loader--field .field-loader-kicker { max-width: 86vw; font-size: 0.58rem; line-height: 1.35; }
  .loader.loader--field .field-loader-copy::after { max-width: 88vw; font-size: 0.5rem; line-height: 1.4; }
  .loader.loader--field .field-loader-progress { left: 9%; right: 19%; bottom: 3.5rem; }
  .loader.loader--field .field-loader-statusbar::before,
  .loader.loader--field .field-loader-statusbar::after { display: none; }
  .loader.loader--field .field-loader-status { left: 9%; right: auto; bottom: 1.3rem; max-width: 80vw; }
  .loader.loader--field .field-loader-readout > b { top: 3.2rem; font-size: 1.65rem; }
  .loader.loader--field .field-loader-readout > span { top: 5.25rem; }
}

@media (prefers-reduced-motion: reduce) {
  .loader.loader--field { animation: dijiang-reference-reduced-exit 2.9s linear both !important; }
  .loader.loader--field::before { animation: none !important; opacity: 0; }
  .loader.loader--field::after { animation: none !important; opacity: 0; }
  .loader.loader--field .field-loader-topband { display: none; }
  .loader.loader--field .field-loader-instrument { opacity: 0.56; transform: translate(-50%, -50%); animation: none !important; }
  .loader.loader--field .field-loader-instrument * { animation: none !important; }
  .loader.loader--field .field-loader-copy { opacity: 1; transform: translate(-50%, -50%); clip-path: none; animation: none !important; }
}

/* Full-motion preview mode: explicit for visual QA, with motion=accessible as the opt-out. */
.loader.loader--field .field-loader-progress {
  height: clamp(0.48rem, 0.74vw, 0.76rem);
  border: 1px solid #536057;
  background: repeating-linear-gradient(90deg, #131b16 0 9%, #2d3b31 9% 9.6%, #131b16 9.6% 19%);
  box-shadow: 0 0 0 1px rgba(243, 239, 24, 0.08), 0 0 0.8rem rgba(243, 239, 24, 0.16);
}

.loader.loader--field .field-loader-progress::before {
  content: "";
  position: absolute;
  z-index: 3;
  top: -0.2rem;
  bottom: -0.2rem;
  left: 0;
  width: 0.3rem;
  background: #f3ef18;
  box-shadow: 0 0 0.55rem rgba(243, 239, 24, 0.86), 0 0 0 1px #080a09;
  animation: dijiang-progress-head 2.6s cubic-bezier(0.22, 1, 0.36, 1) 0.14s infinite;
}

.loader.loader--field .field-loader-progress::after {
  inset: -0.16rem -5.1rem -0.16rem auto;
  width: 4.7rem;
  height: auto;
  background: linear-gradient(90deg, #f3ef18 0 48%, #53d7df 48% 72%, #df4d82 72% 100%);
  clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%);
  box-shadow: 0 0 0.6rem rgba(243, 239, 24, 0.36);
}

.loader.loader--field .field-loader-progress em {
  position: absolute;
  inset: 0;
  width: auto;
  background: repeating-linear-gradient(90deg, #f3ef18 0 9%, #d7e0d8 9% 9.55%, #f3ef18 9.55% 19%);
  box-shadow: 0 0 0.7rem rgba(243, 239, 24, 0.72);
}

.loader.loader--field .field-loader-instrument .instrument-halo {
  stroke-width: 1.5;
  stroke-dasharray: 1 9 3 18;
  animation: dijiang-instrument-spin 11s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-ring--outer {
  stroke-width: 1.5;
  stroke-dasharray: 1 7 11 5;
  animation: dijiang-instrument-spin 8s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-ring--inner {
  stroke-width: 1.5;
  stroke-dasharray: 19 7 3 7;
  animation: dijiang-instrument-spin-reverse 6.5s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-ring--core {
  stroke-width: 2.4;
  stroke-dasharray: 3 5 18 8;
  animation: dijiang-instrument-core-spin 3.8s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-ticks {
  animation: dijiang-instrument-spin 14s linear infinite;
}

.loader.loader--field .field-loader-instrument .instrument-cross {
  stroke: #b8c7bb;
  stroke-width: 1.25;
  stroke-dasharray: 2 8;
  animation: dijiang-instrument-cross 2.4s ease-in-out infinite alternate;
}

.loader.loader--field .field-loader-instrument .instrument-sweep {
  stroke-width: 3.4;
  animation: dijiang-instrument-sweep 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.loader.loader--field .field-loader-instrument .instrument-node {
  r: 10px;
  animation: dijiang-instrument-node 1.35s ease-in-out infinite alternate;
}

@keyframes dijiang-progress-head {
  0%, 12% { transform: translateX(0); opacity: 0; }
  18% { opacity: 1; }
  82% { opacity: 0.9; }
  100% { transform: translateX(calc(100% - 0.3rem)); opacity: 0; }
}

@keyframes dijiang-instrument-spin { to { transform: rotate(360deg); } }
@keyframes dijiang-instrument-spin-reverse { to { transform: rotate(-360deg); } }
@keyframes dijiang-instrument-core-spin { to { transform: rotate(360deg); } }
@keyframes dijiang-instrument-cross { from { opacity: 0.28; } to { opacity: 0.76; } }
@keyframes dijiang-instrument-sweep { 0% { transform: rotate(-42deg); opacity: 0.2; } 18% { opacity: 1; } 76% { opacity: 0.7; } 100% { transform: rotate(360deg); opacity: 0.12; } }
@keyframes dijiang-instrument-node { from { opacity: 0.48; transform: scale(0.78); } to { opacity: 1; transform: scale(1.18); } }

html[data-dijiang-motion="full"] .loader.loader--field { animation: dijiang-reference-exit 4.45s cubic-bezier(0.22, 1, 0.36, 1) both !important; }
html[data-dijiang-motion="full"] .loader.loader--field::before { animation: dijiang-calibration-flash 0.42s steps(1, end) both !important; opacity: 0; }
html[data-dijiang-motion="full"] .loader.loader--field::after { animation: dijiang-blackout-beat 4.45s linear both !important; opacity: 0; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-topband { display: block !important; animation: dijiang-yellow-transfer 4.45s cubic-bezier(0.76, 0, 0.24, 1) both !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument { opacity: 0.72; animation: dijiang-reference-ring-in 0.82s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-halo { animation: dijiang-instrument-spin 11s linear infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-ring--outer { animation: dijiang-instrument-spin 8s linear infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-ring--inner { animation: dijiang-instrument-spin-reverse 6.5s linear infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-ring--core { animation: dijiang-instrument-core-spin 3.8s linear infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-ticks { animation: dijiang-instrument-spin 14s linear infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-cross { animation: dijiang-instrument-cross 2.4s ease-in-out infinite alternate !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-sweep { animation: dijiang-instrument-sweep 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-instrument .instrument-node { animation: dijiang-instrument-node 1.35s ease-in-out infinite alternate !important; }
html[data-dijiang-motion="full"] .loader.loader--field .field-loader-copy { animation: dijiang-reference-focal-in 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both !important; }
`;

export function hardenDijiangDocument(html: string) {
  const withReadout = html.includes('class="field-readout"')
    ? html
    : html.replace('<div class="stamp"', `${dijiangReadoutMarkup}<div class="stamp"`);
  return withReadout.replace("</style>", `${dijiangHardeningCss}</style>`);
}
