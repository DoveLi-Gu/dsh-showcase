// Embedded in the offline poster; only local presentation state is changed.
export const fishMotionScript = `(() => {
  const root = document.querySelector('.poster[data-theme="blue-big-fish"]');
  const brief = root?.querySelector('.fish-brief');
  const toggle = root?.querySelector('[data-fish-motion-toggle]');
  if (!brief || !toggle) return;
  const route = root.querySelector('.current-route');
  const avatar = brief.querySelector('.fish-companion');
  const metrics = [...brief.querySelectorAll('.metric')];
  const media = query => typeof matchMedia === 'function' ? matchMedia(query) : { matches: true };
  const reduced = media('(prefers-reduced-motion: reduce)');
  const fine = media('(hover: hover) and (pointer: fine)');
  const disposers = [];
  let override = null, pointer = null, focused = null, frame = 0, destroyed = false;
  let x = 0, y = 0, nextX = 0, nextY = 0;
  const clamp = value => Math.max(-1, Math.min(1, value));
  function listen(target, name, handler, options) {
    if (!target?.addEventListener) return;
    target.addEventListener(name, handler, options);
    disposers.push(() => target.removeEventListener(name, handler, options));
  }
  function enabled() { return root.dataset.fishMotion === 'full' && !document.hidden; }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; x = y = nextX = nextY = 0;
    brief.style.removeProperty('--fish-look-x');
    brief.style.removeProperty('--fish-look-y');
    brief.style.removeProperty('--fish-look-turn');
  }
  function tick() {
    frame = 0;
    if (destroyed || !enabled()) return;
    x += (nextX - x) * .2; y += (nextY - y) * .2;
    const settled = Math.abs(nextX - x) + Math.abs(nextY - y) < .025;
    if (settled) { x = nextX; y = nextY; }
    brief.style.setProperty('--fish-look-x', x.toFixed(3) + 'px');
    brief.style.setProperty('--fish-look-y', y.toFixed(3) + 'px');
    brief.style.setProperty('--fish-look-turn', (x * .22).toFixed(3) + 'deg');
    if (!settled) frame = requestAnimationFrame(tick);
  }
  function move(tx, ty) {
    nextX = tx; nextY = ty;
    if (enabled() && !frame) frame = requestAnimationFrame(tick);
  }
  function region(target) {
    const found = target?.closest?.('[data-fish-region]');
    return found && root.contains(found) ? found : null;
  }
  function reflect() {
    const active = focused || pointer;
    const area = region(active);
    if (area) brief.dataset.fishAttention = area.dataset.fishRegion;
    else delete brief.dataset.fishAttention;
    const metric = active?.closest?.('.metric');
    metrics.forEach(item => item.toggleAttribute('data-fish-active', item === metric));
    if (!area) move(0, 0);
  }
  function reset() { pointer = focused = null; reflect(); stop(); }
  function preferences() {
    root.dataset.fishMotion = (override ?? !reduced.matches) ? 'full' : 'quiet';
    toggle.checked = root.dataset.fishMotion === 'full';
    toggle.closest('label').hidden = false;
    if (!enabled()) stop();
  }
  function point(event) {
    if (!fine.matches || event.pointerType === 'touch' || document.hidden) return;
    pointer = event.target; reflect();
    if (!enabled()) return;
    const bounds = avatar.getBoundingClientRect();
    const tx = clamp((event.clientX - bounds.left - bounds.width / 2) / 420) * 6;
    const ty = clamp((event.clientY - bounds.bottom + bounds.height * .28) / 180) * 3;
    move(tx, ty);
  }
  [brief, route].forEach(area => {
    listen(area, 'pointermove', point, { passive: true });
    listen(area, 'pointerleave', () => { pointer = null; reflect(); if (!focused) move(0, 0); });
    listen(area, 'pointercancel', reset);
  });
  listen(root, 'focusin', event => {
    focused = region(event.target) ? event.target : null; reflect();
    if (focused) move(3, -2);
  });
  listen(root, 'focusout', event => {
    focused = region(event.relatedTarget) ? event.relatedTarget : null; reflect();
  });
  listen(toggle, 'change', () => { override = toggle.checked; preferences(); });
  listen(reduced, 'change', preferences);
  listen(fine, 'change', reset);
  listen(document, 'visibilitychange', () => { if (document.hidden) reset(); });
  listen(window, 'blur', reset);
  listen(window, 'pagehide', event => {
    reset();
    if (!event.persisted) { destroyed = true; disposers.forEach(dispose => dispose()); }
  });
  preferences();
})();`;
