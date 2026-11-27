import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import useHorizontalSwipe from "../../../hooks/useHorizontalSwipe";
import "./Hero.css";

const collections = [
  { label: "Audio", first: "The listening", last: "room.", detail: "Over-ear headphones, wireless sets and everyday listening gear.", category: "Headphones", action: "Shop headphones", image: "hero-headphones.webp", alt: "Over-ear headphones resting on a warm stone plinth" },
  { label: "Workspace", first: "At your", last: "desk.", detail: "Explore keyboards and computer accessories for the place you work.", category: "Computer Accessories", action: "Shop desk gear", image: "editorial-keyboard.webp", alt: "A close study of the keys on a mechanical keyboard" },
  { label: "Camera", first: "Behind the", last: "lens.", detail: "Browse cameras for spontaneous street shots and considered studio work.", category: "Cameras", action: "Shop cameras", image: "editorial-camera.webp", alt: "A camera body and lens photographed in warm studio light" },
];
const media = "/media/design/";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const story = collections[index];
  const swipe = useHorizontalSwipe(step => setIndex(i => (i + step + collections.length) % collections.length));
  return (
    <section className="studio" aria-label="Shop the collections">
      <div className="studio__spread" {...swipe}>
        <div className="studio__panel">
          <div className="studio__edition"><span aria-hidden="true" /> ElectroNova collections</div>
          <div key={story.label} className="studio__copy" aria-live="polite">
            <h1>{story.first}<br /><em>{story.last}</em></h1>
            <p>{story.detail}</p>
            <Link className="studio__shop" to={"/products?category=" + encodeURIComponent(story.category)}>
              {story.action} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="studio__frame">
          <img key={story.image} src={media + story.image} alt={story.alt} fetchPriority="high" />
          <span className="studio__counter" aria-hidden="true">0{index + 1} / 03</span>
        </div>
      </div>
      <div className="studio__rail">
        <div className="studio__choices" role="group" aria-label="Choose a collection">
          {collections.map((item, i) => (
            <button key={item.label} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
              <img src={media + item.image} alt="" width="46" height="34" />{item.label}
            </button>
          ))}
        </div>
        <Link className="studio__browse" to="/products">Full catalogue <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
