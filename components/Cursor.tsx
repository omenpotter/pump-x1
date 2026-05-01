"use client";
import { useEffect } from "react";

export default function Cursor() {
  useEffect(() => {
    const cur = document.getElementById("cur")!;
    const cur2 = document.getElementById("cur2")!;
    let mx = 0, my = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + "px"; cur.style.top = my + "px";
    };
    document.addEventListener("mousemove", onMove);
    let raf: number;
    const lerp = () => {
      cx += (mx - cx) * 0.13; cy += (my - cy) * 0.13;
      cur2.style.left = cx + "px"; cur2.style.top = cy + "px";
      raf = requestAnimationFrame(lerp);
    };
    lerp();
    const hover = (el: Element) => {
      el.addEventListener("mouseenter", () => { cur.style.width = "20px"; cur.style.height = "20px"; cur2.style.width = "56px"; cur2.style.height = "56px"; });
      el.addEventListener("mouseleave", () => { cur.style.width = "12px"; cur.style.height = "12px"; cur2.style.width = "36px"; cur2.style.height = "36px"; });
    };
    document.querySelectorAll("a, button, .fc, .soc-c").forEach(hover);
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div id="cur" />
      <div id="cur2" />
    </>
  );
}
