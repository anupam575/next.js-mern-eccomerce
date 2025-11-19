"use client";

import React, { useState } from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import "./Sidebar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* 🔹 Navbar Top */}
      <div className="navbar">
        <button className="hamburger" onClick={toggleMenu}>
          <MenuIcon style={{ fontSize: 40 }} />
        </button>
        <h2 className=""></h2>
      </div>

      {/* 🔹 Overlay + Sidebar */}
      {open && <div className="overlay" onClick={closeMenu}></div>}

      <div className={`sidebar ${open ? "open" : ""}`}>
        <button className="close-btn" onClick={closeMenu}>
          <CloseIcon style={{ fontSize: 28 }} />
        </button>

        <ul className="sidebar-links" onClick={closeMenu}>
          <li>
            <Link href="/profile" className="sidebar-link">
              <AccountCircleIcon style={{ fontSize: 28 }} />
              <span>My Account</span>
            </Link>
          </li>

          <li>
            <Link href="/my-orders" className="sidebar-link">
              <Inventory2Icon style={{ fontSize: 26 }} />
              <span>My Orders</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;
