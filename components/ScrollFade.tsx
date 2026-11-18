"use client";
import { useEffect, useRef, ReactNode } from "react";

export default function ScrollFade({ children, className = "fade-up", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      timer = window.setTimeout(() => el.classList.add("vis"), delay);
      io.disconnect();
    }, { threshold: 0.08 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}
