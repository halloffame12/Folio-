"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Progressive reveal for editorial sections.
 *
 * Content is visible by default (including without JavaScript and for
 * prefers-reduced-motion). Once mounted, elements below the fold are briefly
 * "armed" and then revealed as they enter the viewport. This avoids both
 * hydration mismatches and the risk of content never becoming visible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight - 64 && rect.bottom > 0) {
      setShown(true);
      return;
    }

    setArmed(true);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "-64px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        armed && "reveal-armed",
        shown && "reveal-shown"
      )}
      style={
        {
          "--reveal-y": `${y}px`,
          transitionDelay: delay ? `${delay}s` : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
