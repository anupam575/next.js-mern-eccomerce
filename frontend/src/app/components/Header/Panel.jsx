"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import "./Panel.css";

const Panel = () => {
  return (
    <div className="panel">
      <Navbar />

      <ul className="nav-list">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/product">Product</Link>
        </li>
      
      </ul>
    </div>
  );
};

export default Panel;
