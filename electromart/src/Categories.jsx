import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    { name: "Smartphones", icon: "📱" },
    { name: "Audio", icon: "🎧" },
    { name: "Laptops", icon: "💻" },
    { name: "Wearables", icon: "⌚" },
    { name: "Cameras", icon: "📷" },
    { name: "Gaming", icon: "🎮" }
  ];

  return (
    <section id="categories" className="category-section">
      <h2 className="category-title">Shop by Category</h2>

      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            onClick={() =>
              navigate(`/products/category/${cat.name.toLowerCase()}`) // ✅ navigation
            }
          >
            <div className="category-icon">{cat.icon}</div>
            <div className="category-name">{cat.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;