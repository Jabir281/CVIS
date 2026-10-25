/** One cancellable loop per mounted scene; dependencies injected for lifecycle tests. */
export function createFrameLoop(
  request: (callback: FrameRequestCallback) => number,
  cancel: (id: number) => void,
  draw: (delta: number) => void,
) {
  let id: number | null = null;
  let active = false;
  let disposed = false;
  let previous: number | null = null;
  const tick: FrameRequestCallback = (time) => {
    id = null;
    if (disposed || !active) return;
    const delta = previous === null ? 0 : Math.min((time - previous) / 1000, 0.05);
    previous = time;
    draw(delta);
    if (active && !disposed) id = request(tick);
  };
  return {
    setActive(value: boolean) {
      if (disposed || value === active) return;
      active = value;
      previous = null;
      if (active) id = request(tick);
      else if (id !== null) { cancel(id); id = null; }
    },
    dispose() {
      disposed = true;
      active = false;
      if (id !== null) cancel(id);
      id = null;
    },
  };
}
