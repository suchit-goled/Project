import { Link } from "react-router-dom";
import { FiSmartphone, FiHeadphones, FiMonitor, FiWatch, FiCamera, FiCpu, FiArrowUpRight } from "react-icons/fi";
import "./Categories.css";

const departments = [
  ["Smartphones", "Phones", FiSmartphone], ["Laptops", "Laptops", FiMonitor],
  ["Headphones", "Headphones", FiHeadphones], ["Smartwatches", "Watches", FiWatch],
  ["Gaming Accessories", "Gaming", FiCpu], ["Cameras", "Cameras", FiCamera],
];

export default function Categories() {
  return (
    <nav className="departments" aria-label="Shop by department">
      <div className="departments__head"><h2>Shop by department</h2><Link to="/products">See all <FiArrowUpRight /></Link></div>
      <div className="departments__links">{departments.map(([category, label, Icon]) => (
        <Link key={category} to={"/products?category=" + encodeURIComponent(category)}>
          <Icon aria-hidden="true" /><span>{label}</span>
        </Link>
      ))}</div>
    </nav>
  );
}
