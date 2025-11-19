"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import "./category.css";

const CreateCategory = () => {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!newCategory.trim()) {
      toast.warn("⚠️ Please enter a category name!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/admin/category/new", {
        name: newCategory,
      });

      toast.success("✅ Category created successfully!");
      setNewCategory("");

      // optional: navigate to all categories page after creation
      // router.push("/admin/category");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-container">
      <h2 className="category-header">Create Category</h2>

      <div className="form-group">
        <label className="form-label">Category Name</label>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
          className="form-input"
        />
      </div>

      <button
        onClick={handleAdd}
        className={`submit-btn ${loading ? "disabled-btn" : ""}`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Category"}
      </button>
    </div>
  );
};

export default CreateCategory;
