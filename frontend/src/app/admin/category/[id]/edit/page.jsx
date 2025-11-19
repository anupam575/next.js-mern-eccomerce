"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../../../utils/axiosInstance"; // ✅ adjust your alias if needed
import "@/app/admin/category/category.css"; // ✅ import your css

const UpdateCategory = () => {
  const { id } = useParams(); // 🔹 Get dynamic route param from URL
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch category by ID
  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const { data } = await API.get(`/category/${id}`);
        setCategoryName(data.category.name);
      } catch (err) {
        toast.error(err.response?.data?.message || "❌ Failed to load category");
      }
    };
    fetchCategory();
  }, [id]);

  // 🔹 Update category
  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      toast.warn("⚠️ Category name cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/admin/category/${id}`, { name: categoryName });
      toast.success("✅ Category updated successfully!");
      router.push("/admin/category");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-container">
      <h2 className="category-header">Update Category</h2>

      <div className="form-group">
        <label className="form-label">Category Name</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          className="form-input"
        />
      </div>

      <button
        onClick={handleUpdate}
        className={`submit-btn ${loading ? "disabled-btn" : ""}`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Category"}
      </button>
    </div>
  );
};

export default UpdateCategory;
