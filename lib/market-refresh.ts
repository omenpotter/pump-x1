export function refreshVisible(
  task: (signal: AbortSignal) => Promise<void>,
  onFailure: () => void,
  interval: number,
) {
  const controller = new AbortController();
  let timer: number | undefined;
  let inFlight = false;
  let failures = 0;

  async function run() {
    if (inFlight || document.hidden || controller.signal.aborted) return;
    inFlight = true;
    try {
      await task(controller.signal);
      failures = 0;
    } catch {
      if (!controller.signal.aborted) {
        failures++;
        onFailure();
      }
    } finally {
      inFlight = false;
      if (!controller.signal.aborted) {
        timer = window.setTimeout(run, failures ? Math.min(interval, 10_000 * 2 ** Math.min(failures - 1, 3)) : interval);
      }
    }
  }

  function resume() {
    window.clearTimeout(timer);
    void run();
  }
  timer = window.setTimeout(run, 0);
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("online", resume);
  return () => {
    controller.abort();
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("online", resume);
  };
}
