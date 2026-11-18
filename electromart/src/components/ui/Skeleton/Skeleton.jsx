import React from "react";
import "./Skeleton.css";

export const Skeleton = ({ width, height, borderRadius, className = "", style = {} }) => {
    return (
        <div
            className={`skeleton-shimmer skeleton-block ${className}`}
            style={{
                width: width || "100%",
                height: height || "16px",
                borderRadius: borderRadius || "var(--radius-sm)",
                ...style,
            }}
        />
    );
};

export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-shimmer skeleton-image" />
        <div className="skeleton-shimmer skeleton-title" />
        <div className="skeleton-shimmer skeleton-subtitle" />
        <div className="skeleton-price-row">
            <div className="skeleton-shimmer skeleton-price" />
            <div className="skeleton-shimmer skeleton-button" />
        </div>
    </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
    <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, idx) => (
            <SkeletonCard key={idx} />
        ))}
    </div>
);

export const SkeletonStatCard = () => (
    <div className="skeleton-stat-card">
        <Skeleton width="40%" height="14px" />
        <Skeleton width="65%" height="28px" />
        <Skeleton width="50%" height="12px" />
    </div>
);

export const SkeletonTableRow = ({ columns = 5 }) => (
    <div className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton
                key={idx}
                width={idx === 0 ? "30%" : `${Math.floor(70 / (columns - 1))}%`}
                height="16px"
            />
        ))}
    </div>
);

export default Skeleton;
