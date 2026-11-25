import React, { useEffect, useRef } from "react";
import "./CyberCanvas.css";

const CyberCanvas = ({ density = 45, interactive = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Graceful fallback for test or server environments
    if (process.env.NODE_ENV === "test" || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = null;
    try {
      if (typeof canvas.getContext === "function") {
        ctx = canvas.getContext("2d");
      }
    } catch (e) {
      return;
    }
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const isReducedMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")?.matches
      : false;

    // Check dark mode
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    const particles = [];
    const particleCount = Math.min(density, Math.floor((width * height) / 18000));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isReducedMotion ? 0 : 0.6),
        vy: (Math.random() - 0.5) * (isReducedMotion ? 0 : 0.6),
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? "rgba(34, 211, 238, " : i % 3 === 1 ? "rgba(59, 130, 246, " : "rgba(139, 92, 246, ",
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    let mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    window.addEventListener("resize", handleResize);
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      const maxDistance = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.18 : 0.08);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        // Mouse reaction
        if (interactive) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouse.radius) {
            const force = (1 - mdist / mouse.radius) * 1.5;
            p.x += (mdx / mdist) * force;
            p.y += (mdy / mdist) * force;
          }
        }

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.baseAlpha + ")";
        ctx.fill();
      });

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [density, interactive]);

  return <canvas ref={canvasRef} className="cyber-canvas" aria-hidden="true" />;
};

export default CyberCanvas;
