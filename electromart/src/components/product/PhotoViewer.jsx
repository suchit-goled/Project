import { useRef } from "react";
import { FiMaximize2, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CatalogImage from "../common/CatalogImage";
import useHorizontalSwipe from "../../hooks/useHorizontalSwipe";
import "./PhotoViewer.css";

export default function PhotoViewer({ photos, selected, onSelect, title }) {
  const dialog = useRef(null);
  const index = Math.max(0, photos.indexOf(selected));
  const src = photos[index];
  const step = (direction) => {
    if (photos.length > 1) onSelect(photos[(index + direction + photos.length) % photos.length]);
  };
  const swipe = useHorizontalSwipe(step);
  return (
    <>
      <div className="viewer-preview" {...swipe}>
        <CatalogImage key={src} src={src} alt={title} className="primary-product-image" loading="eager" />
        {src && <button className="viewer-open" type="button" onClick={() => dialog.current.showModal()}>
          <FiMaximize2 aria-hidden="true" /> Enlarge
        </button>}
      </div>
      <dialog ref={dialog} className="photo-viewer" aria-label={title + " image viewer"}
        onKeyDown={event => {
          if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
        }}>
        <div className="photo-viewer__bar">
          <strong>{title}</strong>
          <button type="button" aria-label="Close image viewer" onClick={() => dialog.current.close()}><FiX /></button>
        </div>
        <div className="photo-viewer__stage" {...swipe}>
          <CatalogImage key={src} src={src} alt={title} loading="lazy" />
        </div>
        {photos.length > 1 && <div className="photo-viewer__controls">
          <button type="button" aria-label="Previous photo" onClick={() => step(-1)}><FiChevronLeft /></button>
          <output>{index + 1} / {photos.length}</output>
          <button type="button" aria-label="Next photo" onClick={() => step(1)}><FiChevronRight /></button>
        </div>}
      </dialog>
    </>
  );
}
