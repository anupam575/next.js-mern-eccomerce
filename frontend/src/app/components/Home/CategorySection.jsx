"use client";

import "./style/category.css";

const categories = [
  { name: "Men's Fashion", image: "/images/men.jpg" },
  { name: "Women's Fashion", image: "/images/women.jpg" },
  { name: "Electronics", image: "/images/electronics.jpg" },
  { name: "Home Appliances", image: "/images/home.jpg" },
];

function CategorySection() {
  return (
    <div className="category-section">
      <h2 className="section-title">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat, index) => (
          <div className="category-card" key={index}>
            <img src={cat.image} alt={cat.name} className="category-img" />
            <h3 className="category-name">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySection;
