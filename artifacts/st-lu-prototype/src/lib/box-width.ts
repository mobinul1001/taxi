import { useLayoutEffect, useRef, useState } from "react";

/** Measures the box a component sits in. Lives on its own so the agency pages can use it without loading the St Lu app. */
export function useBoxWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(4000);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const f = () => setW(el.clientWidth);
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}
