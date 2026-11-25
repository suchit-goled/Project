import React, { useState, useEffect } from "react";

/**
 * CatalogImage
 * Renders actual product/variant photography with natural aspect preservation.
 * Falls back to a neutral "Image unavailable" block if missing or failed to load.
 */
const CatalogImage = ({
  src,
  alt = "Product photograph",
  className = "",
  style = {},
  loading = "lazy",
}) => {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`image-unavailable-fallback ${className}`}
        style={style}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
};

export default CatalogImage;
