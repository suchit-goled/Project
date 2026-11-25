import React, { useState, useEffect } from "react";
import "./SplashLoader.css";

const SplashLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState("INITIALIZING NEONVERSE CORE...");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasLoaded = sessionStorage.getItem("electronova_splash_shown");
    if (hasLoaded && !window.location.search.includes("splash=true")) {
      if (onComplete) onComplete();
      return;
    }

    const phases = [
      { at: 20, text: "CALIBRATING QUANTUM SENSORS..." },
      { at: 50, text: "SYNCING MARKETPLACE MESH..." },
      { at: 80, text: "ENABLING GLASSMORPHIC HUD..." },
      { at: 100, text: "WELCOME TO NEONVERSE." },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsClosing(true);
            sessionStorage.setItem("electronova_splash_shown", "true");
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 400);
          return 100;
        }

        const next = Math.min(prev + Math.floor(Math.random() * 15 + 10), 100);
        const match = phases.find((p) => next >= p.at && prev < p.at);
        if (match) setPhaseText(match.text);
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  const hasLoaded = typeof sessionStorage !== "undefined" && sessionStorage.getItem("electronova_splash_shown");
  if (hasLoaded && !window.location.search.includes("splash=true") && !isClosing && progress === 0) {
    return null;
  }

  return (
    <div className={`splash-loader ${isClosing ? "splash-loader--closing" : ""}`} role="status" aria-label="Loading ElectroNova">
      <div className="splash-ambient-mesh" aria-hidden="true" />
      <div className="splash-content">
        {/* Animated Custom Logo */}
        <div className="splash-logo-container">
          <div className="splash-halo-ring" />
          <svg width="84" height="84" viewBox="0 0 48 48" fill="none" className="splash-svg">
            <defs>
              <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="splash-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x="4" y="4" width="40" height="40" rx="12" stroke="url(#splash-grad)" strokeWidth="2" fill="rgba(16, 23, 42, 0.7)" filter="url(#splash-glow)" />
            <path
              d="M26 10L14 24H22L19 38L32 21H24L26 10Z"
              fill="url(#splash-grad)"
              className="splash-lightning-path"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="splash-brand-title">
          Electro<span className="splash-brand-accent">Nova</span>
        </h1>
        <p className="splash-brand-sub">THE FUTURE OF ELECTRONICS SHOPPING</p>

        {/* Futuristic Cyber Progress Bar */}
        <div className="splash-hud-container">
          <div className="splash-progress-track">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="splash-meta-row">
            <span className="splash-phase-text">{phaseText}</span>
            <span className="splash-percentage-text">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashLoader;
