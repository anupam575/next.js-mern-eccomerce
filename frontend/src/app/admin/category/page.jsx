"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../../utils/axiosInstance";
import ConfirmModal from "../../components/Header/ConfirmModal";
import "./category.css";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await API.get("/categories");
        setCategories(res.data.categories);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const confirmDelete = (id) => {
    setSelectedCatId(id);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedCatId) return;
    setLoading(true);
    try {
      await API.delete(`/admin/category/${selectedCatId}`);
      setCategories(categories.filter((cat) => cat._id !== selectedCatId));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedCatId(null);
    }
  };

  return (
    <div className="category-container">
      <h2 className="category-title">Category Management</h2>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <table className="category-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => router.push(`/admin/category/${cat._id}/edit`)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => confirmDelete(cat._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        show={modalVisible}
        message="Are you sure you want to delete?"
        onConfirm={handleDelete}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default CategoryList;
