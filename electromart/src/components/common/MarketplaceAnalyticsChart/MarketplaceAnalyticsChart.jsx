import React, { useState } from "react";
import { FiActivity } from "react-icons/fi";
import "./MarketplaceAnalyticsChart.css";

const MarketplaceAnalyticsChart = ({
    title = "Marketplace Revenue & Velocity",
    totalAmount = 0,
    subtitle = "Live transactional volume and daily order velocity across verified sellers",
    accentColor = "cyan"
}) => {
    const [timeframe, setTimeframe] = useState("30d");
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Dynamic mock datasets scaled by totalAmount
    const baseVal = Math.max(totalAmount, 250000);

    const data30d = [
        { label: "Day 1", value: Math.round(baseVal * 0.024), orders: 12 },
        { label: "Day 5", value: Math.round(baseVal * 0.031), orders: 18 },
        { label: "Day 9", value: Math.round(baseVal * 0.028), orders: 15 },
        { label: "Day 13", value: Math.round(baseVal * 0.045), orders: 24 },
        { label: "Day 17", value: Math.round(baseVal * 0.038), orders: 20 },
        { label: "Day 21", value: Math.round(baseVal * 0.052), orders: 29 },
        { label: "Day 25", value: Math.round(baseVal * 0.048), orders: 26 },
        { label: "Day 30", value: Math.round(baseVal * 0.061), orders: 35 },
    ];

    const data7d = [
        { label: "Mon", value: Math.round(baseVal * 0.012), orders: 8 },
        { label: "Tue", value: Math.round(baseVal * 0.018), orders: 12 },
        { label: "Wed", value: Math.round(baseVal * 0.015), orders: 10 },
        { label: "Thu", value: Math.round(baseVal * 0.022), orders: 16 },
        { label: "Fri", value: Math.round(baseVal * 0.029), orders: 21 },
        { label: "Sat", value: Math.round(baseVal * 0.036), orders: 26 },
        { label: "Sun", value: Math.round(baseVal * 0.041), orders: 30 },
    ];

    const activeData = timeframe === "7d" ? data7d : data30d;
    const maxValue = Math.max(...activeData.map(d => d.value));

    // SVG coordinate calculations (viewBox 0 0 700 200)
    const svgWidth = 700;
    const svgHeight = 200;
    const paddingX = 40;
    const paddingY = 25;
    const chartW = svgWidth - paddingX * 2;
    const chartH = svgHeight - paddingY * 2;

    const points = activeData.map((d, i) => {
        const x = paddingX + (i / (activeData.length - 1)) * chartW;
        const y = paddingY + chartH - (d.value / (maxValue || 1)) * chartH;
        return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cx1 = prev.x + (p.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (p.x - prev.x) / 2;
        const cy2 = p.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

    return (
        <div className="analytics-chart-card holographic-panel">
            <div className="analytics-header">
                <div>
                    <div className="analytics-tag">
                        <FiActivity size={12} />
                        <span>NEURAL ANALYTICS ENGINE</span>
                    </div>
                    <h3 className="analytics-title">{title}</h3>
                    <p className="analytics-sub">{subtitle}</p>
                </div>

                <div className="analytics-controls">
                    <div className="analytics-timeframe-pills">
                        <button
                            className={`timeframe-pill ${timeframe === "7d" ? "active" : ""}`}
                            onClick={() => setTimeframe("7d")}
                        >
                            7 Days
                        </button>
                        <button
                            className={`timeframe-pill ${timeframe === "30d" ? "active" : ""}`}
                            onClick={() => setTimeframe("30d")}
                        >
                            30 Days
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics HUD */}
            <div className="analytics-hud-row">
                <div className="hud-metric">
                    <span className="hud-metric-label">Period Velocity</span>
                    <strong className="hud-metric-val">+24.8%</strong>
                    <span className="hud-metric-trend">vs previous cycle</span>
                </div>
                <div className="hud-metric">
                    <span className="hud-metric-label">Avg Transaction</span>
                    <strong className="hud-metric-val">₹{Math.round(baseVal / 85).toLocaleString()}</strong>
                    <span className="hud-metric-trend">Per customer checkout</span>
                </div>
                <div className="hud-metric">
                    <span className="hud-metric-label">Escrow Settlement</span>
                    <strong className="hud-metric-val">Instant 24h</strong>
                    <span className="hud-metric-trend">Zero dispute rate</span>
                </div>
                <div className="hud-metric">
                    <span className="hud-metric-label">Platform Uptime</span>
                    <strong className="hud-metric-val">99.98%</strong>
                    <span className="hud-metric-trend">All clusters online</span>
                </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="chart-svg-container">
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="analytics-svg"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
                            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#080B14" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#22D3EE" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingY + chartH * ratio;
                        return (
                            <line
                                key={idx}
                                x1={paddingX}
                                y1={y}
                                x2={svgWidth - paddingX}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeDasharray="3 3"
                            />
                        );
                    })}

                    {/* Area under curve */}
                    <path d={areaD} fill="url(#chart-area-grad)" />

                    {/* Smooth curve line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="url(#chart-line-grad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Interactive Points */}
                    {points.map((p, idx) => (
                        <g key={idx} className="chart-node-group">
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#22D3EE"
                                stroke="#080B14"
                                strokeWidth="2"
                                className="chart-node-circle"
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        </g>
                    ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredPoint && (
                    <div
                        className="chart-tooltip"
                        style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                        }}
                    >
                        <strong>{hoveredPoint.label}</strong>
                        <div>₹{hoveredPoint.value.toLocaleString()}</div>
                        <small>{hoveredPoint.orders} Orders</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceAnalyticsChart;
