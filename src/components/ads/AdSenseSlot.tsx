"use client";

import { useEffect, useRef } from "react";

type AdSenseSlotProps = {
  html: string;
  className?: string;
};

/**
 * Injects admin-pasted AdSense (or similar) markup and runs inline/external scripts.
 * Only mount on trusted admin-provided snippets.
 */
export function AdSenseSlot({ html, className = "" }: AdSenseSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trimmed = html.trim();
    if (!trimmed) return;

    el.innerHTML = "";
    const tpl = document.createElement("template");
    tpl.innerHTML = trimmed;
    const scripts = Array.from(tpl.content.querySelectorAll("script"));
    for (const s of scripts) {
      s.remove();
    }
    el.appendChild(tpl.content.cloneNode(true));
    for (const old of scripts) {
      const s = document.createElement("script");
      for (const attr of old.attributes) {
        s.setAttribute(attr.name, attr.value);
      }
      if (old.textContent) {
        s.textContent = old.textContent;
      }
      el.appendChild(s);
    }
  }, [html]);

  if (!html.trim()) return null;

  return (
    <div
      ref={ref}
      className={`flex min-h-[50px] w-full justify-center overflow-x-auto ${className}`.trim()}
      data-ad-slot="1"
      aria-label="Advertisement"
    />
  );
}
