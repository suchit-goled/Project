import React, { useEffect, useState } from "react";
import "./MouseGlow.css";

const MouseGlow = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices with matchMedia support
    if (process.env.NODE_ENV === "test" || typeof window === "undefined" || !window.matchMedia) return;

    try {
      const isFine = window.matchMedia("(pointer: fine)")?.matches;
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)")?.matches;
      if (!isFine || isReduced) return;
    } catch (e) {
      return;
    }

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (document.body) {
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (document.body) {
        document.body.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="ambient-mouse-glow"
      style={{
        transform: `translate3d(${pos.x - 200}px, ${pos.y - 200}px, 0)`,
      }}
      aria-hidden="true"
    />
  );
};

export default MouseGlow;
