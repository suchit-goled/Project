import { useRef } from "react";

// Leave vertical scrolling and two-finger gestures to the browser.
export default function useHorizontalSwipe(onStep) {
  const origin = useRef(null);
  return {
    onTouchStart(event) {
      const point = event.touches[0];
      origin.current = event.touches.length === 1 ? [point.clientX, point.clientY] : null;
    },
    onTouchCancel() { origin.current = null; },
    onTouchEnd(event) {
      const start = origin.current;
      origin.current = null;
      if (!start || event.touches.length || !event.changedTouches.length) return;
      const point = event.changedTouches[0];
      const dx = point.clientX - start[0];
      const dy = point.clientY - start[1];
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1);
    },
  };
}
