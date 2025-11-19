"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import ConfirmModal from "../../components/Header/ConfirmModal";
import "./AdminUsersPanel.css";

// ✅ MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const router = useRouter();

  // 🔹 Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch single user
  const fetchSingleUser = async (id) => {
    try {
      const { data } = await API.get(`/admin/user/${id}`);
      setSelectedUser(data.user);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user details");
    }
  };

  // 🔹 Update role
  const updateUserRole = async (id, role) => {
    const originalUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u))
    );

    try {
      await API.put(`/admin/user/${id}`, { role });
      toast.success("Role updated successfully");
    } catch (err) {
      setUsers(originalUsers);
      toast.error("Failed to update role");
    }
  };

  // 🔹 Delete user
  const confirmDelete = async () => {
    if (!deleteUserId) return;
    const originalUsers = [...users];
    setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
    setDeleteUserId(null);

    try {
      await API.delete(`/admin/user/${deleteUserId}`);
      toast.success("User deleted successfully");
    } catch (err) {
      setUsers(originalUsers);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 🔹 Desktop table view
  const desktopRows = useMemo(
    () =>
      users.map((u) => (
        <tr key={u._id}>
          <td>{u._id}</td>
          <td>{u.name}</td>
          <td>{u.email}</td>
          <td>
            <select
              value={u.role}
              onChange={(e) => updateUserRole(u._id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <td>
            <button
              onClick={() => fetchSingleUser(u._id)}
              className="view-btn"
              aria-label={`View ${u.name}`}
            >
              <VisibilityIcon fontSize="small" /> View
            </button>
          </td>
          <td>
            <button
              className="delete-btn"
              onClick={() => setDeleteUserId(u._id)}
              aria-label={`Delete ${u.name}`}
            >
              <DeleteIcon fontSize="small" /> Delete
            </button>
          </td>
        </tr>
      )),
    [users]
  );

  // 🔹 Mobile cards view
  const mobileCards = useMemo(
    () =>
      users.map((u) => (
        <div className="user-card" key={u._id}>
          <p><strong>ID:</strong> {u._id}</p>
          <p><strong>Name:</strong> {u.name}</p>
          <p><strong>Email:</strong> {u.email}</p>
          <p><strong>Role:</strong> {u.role}</p>
          <div className="card-actions">
            <select
              value={u.role}
              onChange={(e) => updateUserRole(u._id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={() => fetchSingleUser(u._id)}
              className="view-btn"
              aria-label={`View ${u.name}`}
            >
              <VisibilityIcon fontSize="small" /> View
            </button>
            <button
              className="delete-btn"
              onClick={() => setDeleteUserId(u._id)}
              aria-label={`Delete ${u.name}`}
            >
              <DeleteIcon fontSize="small" /> Delete
            </button>
          </div>
        </div>
      )),
    [users]
  );

  return (
    <div className="admin-users-container">
      <div className="top-bar">
        <Link href="/admin/dashboard" className="back-btn">
          <ArrowBackIcon fontSize="small" /> Back to Dashboard
        </Link>
        <h2>
          <PeopleAltIcon
            fontSize="medium"
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          Admin Panel - Manage Users
        </h2>
      </div>

      {loading ? (
        <p className="loading-text">
          <AccessTimeIcon
            fontSize="small"
            style={{ verticalAlign: "middle" }}
          />{" "}
          Loading users...
        </p>
      ) : users.length === 0 ? (
        <p className="no-data-text">No users found.</p>
      ) : (
        <>
          <div className="desktop-users">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>{desktopRows}</tbody>
            </table>
          </div>

          <div className="mobile-users">{mobileCards}</div>
        </>
      )}

      {selectedUser && (
        <div className="single-user-card">
          <h3>Single User Details:</h3>
          <p><strong>ID:</strong> {selectedUser._id}</p>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
        </div>
      )}

      {/* ✅ Confirm Modal */}
      <ConfirmModal
        show={!!deleteUserId}
        message="Are you sure you want to delete this user?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
};

export default AdminUsersPanel;
