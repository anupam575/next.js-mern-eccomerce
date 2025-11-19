"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ProductModal from "../components/Section/modal/ProductModal";
import OrderModel from "../components/Section/modal/OrderModel";

import ProtectedRoute from "./ProtectedRoute";
import "./AdminDashboard.css";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="dashboard-container">
        {/* Toggle Button */}
        <button className="hamburger-btn" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <ChevronLeft fontSize="large" />
          ) : (
            <ChevronRight fontSize="large" />
          )}
        </button>

        {/* Sidebar */}
        <aside className={`sidebars ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header">
            <h2 className="sidebars-title">Admin Dashboard</h2>
          </div>

          <ul className="sidebars-menu">
            <ProductModal />
                      <OrderModel />

          </ul>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
