"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Productmodal.css";

const ProductModal = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // ✅ current route for active link

  const productItems = [
    { name: "Create Product", link: "/admin/create-product" },
    { name: "All Product", link: "/admin/products" },
    { name: "Create Category", link: "/admin/create-category" },
    { name: "All Category", link: "/admin/category" },
        { name: "All User", link: "/admin/alluser" },

  ];

  return (
    <li className="product-modal">
      <div onClick={() => setOpen(!open)} className="create-toggle">
        Create product {open ? "▲" : "▼"}
      </div>

      {open && (
        <ul className="create-submenu">
          {productItems.map((item, index) => {
            const isActive = pathname === item.link; // ✅ active state check
            return (
              <li key={index}>
                <Link
                  href={item.link}
                  className={`create-link ${isActive ? "active" : ""}`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default ProductModal;
