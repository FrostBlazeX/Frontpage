import { useEffect } from "react";

// `overflow: hidden` on the body isn't enough on iOS Safari — it still lets
// the page scroll/rubber-band behind a fixed-position overlay via touch.
// Pinning the body with `position: fixed` removes it from the scrollable
// flow entirely, which is the fix that actually holds on touch devices.
function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { position, top, left, right, width, overflow } = document.body.style;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.left = left;
      document.body.style.right = right;
      document.body.style.width = width;
      document.body.style.overflow = overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

export default useLockBodyScroll;
