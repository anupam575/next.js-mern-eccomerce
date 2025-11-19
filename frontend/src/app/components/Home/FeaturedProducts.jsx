"use client";
import Image from "next/image";
import "./style/featured.css";

// 🧾 Categories Data
const categories = [
  { id: 1, name: "Headphones", image: "/images/product1.jpg" },
  { id: 2, name: "Watches", image: "/images/product2.jpg" },
  { id: 3, name: "Shoes", image: "/images/product3.jpg" },
  { id: 4, name: "Gaming", image: "/images/product4.jpg" },
];

export default function FeaturedProducts() {
  return (
    <div className="shop-section">
      {/* 🔹 Shop by Category */}
      <div className="category-section">
        <h2 className="section-title">Featured Products</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <div className="category-card" key={cat.id}>
              <Image
                src={cat.image}
                alt={cat.name}
                className="category-img"
                width={250}
                height={250}
              />
              <h3 className="category-name">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
