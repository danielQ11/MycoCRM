"use client";

import { ReactNode, useLayoutEffect, useId, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

type Props = {
  height: number;
  children: ReactNode;
  className?: string;
  remountKey?: string | number;
};

export default function ResponsiveChart({ height, children, className = "", remountKey = "" }: Props) {
  const [size, setSize] = useState({ width: 0, height });
  const containerRef = useRef<HTMLDivElement>(null);
  const chartId = useId();

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height });
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [height, remountKey]);

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 max-w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      {size.width > 0 && (
        <ResponsiveContainer key={`${chartId}-${remountKey}-${size.width}`} width="100%" height="100%" minWidth={0} debounce={50}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}
