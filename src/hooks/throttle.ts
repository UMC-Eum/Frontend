export function throttle(fn: () => void, delay: number) {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn();
    }
  };
}
