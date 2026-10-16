import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const modulePath = '../plugin/fish-motion.js' as string;

function emitter() {
  const handlers = new Map<string, Set<(event: any) => void>>();
  return {
    handlers,
    addEventListener(name: string, handler: (event: any) => void) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name)!.add(handler);
    },
    removeEventListener(name: string, handler: (event: any) => void) { handlers.get(name)?.delete(handler); },
    emit(name: string, event: any = {}) { [...(handlers.get(name) || [])].forEach(handler => handler(event)); },
  };
}

async function fixture(reduce = false, finePointer = true) {
  const { fishMotionScript } = await import(modulePath);
  const styles = new Map<string, string>();
  const frames = new Map<number, () => void>();
  let sequence = 0;
  function region(name: string) {
    const item: any = { ...emitter(), dataset: { fishRegion: name }, closest: (selector: string) => selector === '[data-fish-region]' ? item : null };
    return item;
  }
  const avatar = region('companion');
  avatar.getBoundingClientRect = () => ({ left: 0, width: 200, height: 200, bottom: 200 });
  const task = region('task');
  const route = region('route');
  const metricRegion = region('metrics');
  const metric: any = {
    attributes: new Set<string>(),
    closest: (selector: string) => selector === '.metric' ? metric : metricRegion,
    toggleAttribute: (name: string, enabled: boolean) => enabled ? metric.attributes.add(name) : metric.attributes.delete(name),
  };
  const label = { hidden: true };
  const toggle = { ...emitter(), checked: false, closest: () => label };
  const brief = {
    ...emitter(), dataset: {} as Record<string, string>,
    style: { setProperty: (name: string, value: string) => styles.set(name, value), removeProperty: (name: string) => styles.delete(name) },
    querySelector: () => avatar, querySelectorAll: () => [metric],
  };
  const root = {
    ...emitter(), dataset: {} as Record<string, string>,
    querySelector: (selector: string) => selector === '.fish-brief' ? brief : selector === '.current-route' ? route : toggle,
    contains: (element: unknown) => [avatar, task, route, metricRegion].includes(element as any),
  };
  const doc = { ...emitter(), hidden: false, querySelector: () => root };
  const win = emitter();
  const reduced = { ...emitter(), matches: reduce };
  const fine = { ...emitter(), matches: finePointer };
  runInNewContext(fishMotionScript, {
    document: doc, window: win,
    matchMedia: (query: string) => query.includes('reduced-motion') ? reduced : fine,
    requestAnimationFrame: (callback: () => void) => { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  });
  const move = (target = task, x = 1000, y = 1000, type = 'mouse') => brief.emit('pointermove', { target, clientX: x, clientY: y, pointerType: type });
  const flush = () => {
    let remaining = 150;
    while (frames.size && remaining-- > 0) {
      const queued = [...frames.values()]; frames.clear(); queued.forEach(callback => callback());
    }
    expect(frames.size).toBe(0);
  };
  return { root, brief, avatar, task, route, metric, toggle, label, doc, win, reduced, fine, styles, frames, move, flush };
}

describe('offline fish companion interactions', () => {
  it('starts in quiet mode for reduced motion, retaining expression feedback', async () => {
    const f = await fixture(true);
    expect(f.root.dataset.fishMotion).toBe('quiet');
    expect(f.toggle.checked).toBe(false);
    expect(f.label.hidden).toBe(false);
    f.move();
    expect(f.brief.dataset.fishAttention).toBe('task');
    expect(f.frames.size).toBe(0);
    f.toggle.checked = true; f.toggle.emit('change'); f.move(); f.flush();
    expect(f.root.dataset.fishMotion).toBe('full');
    expect(f.styles.get('--fish-look-x')).toBe('6.000px');
  });

  it('bounds pointer movement, coalesces frames and settles rather than looping forever', async () => {
    const f = await fixture();
    for (let i = 0; i < 20; i++) f.move(f.task, 10000, -10000);
    expect(f.frames.size).toBe(1);
    f.flush();
    expect(f.styles.get('--fish-look-x')).toBe('6.000px');
    expect(f.styles.get('--fish-look-y')).toBe('-3.000px');
    expect(f.styles.get('--fish-look-turn')).toBe('1.320deg');
    f.brief.emit('pointerleave'); f.flush();
    expect(f.styles.get('--fish-look-x')).toBe('0.000px');
    expect(f.brief.dataset.fishAttention).toBeUndefined();
  });

  it('connects metric feedback to the actual hovered metric without changing report data', async () => {
    const f = await fixture();
    f.move(f.metric); f.flush();
    expect(f.metric.attributes.has('data-fish-active')).toBe(true);
    expect(f.brief.dataset.fishAttention).toBe('metrics');
    f.move(f.task); f.flush();
    expect(f.metric.attributes.has('data-fish-active')).toBe(false);
    expect(f.root.dataset).not.toHaveProperty('status');
  });

  it('supports keyboard attention independently of the pointer', async () => {
    const f = await fixture();
    f.root.emit('focusin', { target: f.avatar });
    f.brief.emit('pointerleave'); f.flush();
    expect(f.brief.dataset.fishAttention).toBe('companion');
    f.root.emit('focusout', { relatedTarget: f.route });
    expect(f.brief.dataset.fishAttention).toBe('route');
    f.root.emit('focusout', { relatedTarget: null }); f.flush();
    expect(f.brief.dataset.fishAttention).toBeUndefined();
  });

  it('does not leave a hover state behind after touch or pointer cancellation', async () => {
    const f = await fixture();
    f.move(f.task, 100, 100, 'touch');
    expect(f.brief.dataset.fishAttention).toBeUndefined();
    expect(f.frames.size).toBe(0);
    f.move(); f.brief.emit('pointercancel');
    expect(f.brief.dataset.fishAttention).toBeUndefined();
    expect(f.frames.size).toBe(0);
    const coarse = await fixture(false, false);
    coarse.move(); expect(coarse.frames.size).toBe(0);
  });

  it('responds to system settings until the user explicitly chooses otherwise', async () => {
    const f = await fixture();
    f.move();
    f.reduced.matches = true; f.reduced.emit('change');
    expect(f.root.dataset.fishMotion).toBe('quiet');
    expect(f.frames.size).toBe(0);
    f.toggle.checked = true; f.toggle.emit('change');
    f.reduced.emit('change');
    expect(f.root.dataset.fishMotion).toBe('full');
    f.toggle.checked = false; f.toggle.emit('change');
    expect(f.styles.size).toBe(0);
  });

  it('stops when hidden, resumes after bfcache and disposes listeners on final departure', async () => {
    const f = await fixture();
    f.move(); f.doc.hidden = true; f.doc.emit('visibilitychange');
    expect(f.frames.size).toBe(0);
    expect(f.styles.size).toBe(0);
    f.doc.hidden = false; f.win.emit('pagehide', { persisted: true });
    f.move(); f.flush(); expect(f.styles.size).toBe(3);
    f.win.emit('pagehide', { persisted: false });
    f.move(); expect(f.frames.size).toBe(0);
    expect([...f.brief.handlers.values()].every(handlers => handlers.size === 0)).toBe(true);
  });
});
