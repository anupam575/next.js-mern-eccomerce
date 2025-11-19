"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "./AllOrdersPage.css";
import OrderStatusUpdater from "../../components/Section/OrderStatusUpdater";
import ConfirmModal from "../../components/Header/ConfirmModal";
import API from "../../../utils/axiosInstance";

// ✅ MUI Icons
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  // ✅ Fetch Orders
  const fetchOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/orders?page=${pageNumber}&limit=10`);
      setOrders(data.orders);
      setTotalAmount(data.totalAmount);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
      setError("");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        router.push("/login");
      } else {
        setError("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirm Delete
  const confirmDelete = async () => {
    if (!deleteOrderId) return;
    const originalOrders = [...orders];
    setOrders((prev) => prev.filter((o) => o._id !== deleteOrderId));
    setDeleteOrderId(null);
    toast.info("Deleting order...");

    try {
      await API.delete(`/admin/order/${deleteOrderId}`);
      toast.success("Order deleted successfully");
      fetchOrders(page);
    } catch (err) {
      console.error(err);
      setOrders(originalOrders);
      toast.error(err.response?.data?.message || "Failed to delete the order");
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, []);

  // ✅ Pagination handlers
  const handlePrevPage = () => page > 1 && fetchOrders(page - 1);
  const handleNextPage = () => page < totalPages && fetchOrders(page + 1);
  const handlePageClick = (p) => p !== page && fetchOrders(p);

  // ✅ Desktop Table Rows
  const desktopRows = useMemo(
    () =>
      orders.map((order) => (
        <tr key={order._id}>
          <td>{order._id}</td>
          <td>{order.user?.name || "N/A"}</td>
          <td>{order.user?.email || "N/A"}</td>
          <td>₹{order.totalPrice}</td>
          <td>
            <OrderStatusUpdater
              orderId={order._id}
              currentStatus={order.orderStatus}
              onStatusChange={() => fetchOrders(page)}
            />
          </td>
          <td>
            <button
              className="view-btn"
              onClick={() => router.push(`/admin/all-orders/${order._id}`)}
            >
              View
            </button>
          </td>
          <td>
            <button
              className="delete-btn"
              onClick={() => setDeleteOrderId(order._id)}
              aria-label="Delete order"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </td>
        </tr>
      )),
    [orders, page]
  );

  // ✅ Mobile Cards
  const mobileCards = useMemo(
    () =>
      orders.map((order) => (
        <div className="order-card" key={order._id}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>User:</strong> {order.user?.name || "N/A"}</p>
          <p><strong>Email:</strong> {order.user?.email || "N/A"}</p>
          <p><strong>Total:</strong> ₹{order.totalPrice}</p>

          <div className="card-actions">
            <OrderStatusUpdater
              orderId={order._id}
              currentStatus={order.orderStatus}
              onStatusChange={() => fetchOrders(page)}
            />
            <button
              className="view-btn"
              onClick={() => router.push(`/admin/all-orders/${order._id}`)}
            >
              View
            </button>
            <button
              className="delete-btn"
              onClick={() => setDeleteOrderId(order._id)}
            >
              <DeleteIcon fontSize="small" /> Delete
            </button>
          </div>
        </div>
      )),
    [orders, page]
  );

  // ✅ States UI
  if (loading)
    return (
      <p className="center">
        <AccessTimeIcon fontSize="small" style={{ verticalAlign: "middle" }} />{" "}
        Loading orders...
      </p>
    );

  if (error)
    return (
      <p className="center error">
        {error} <button onClick={() => fetchOrders(page)}>Retry</button>
      </p>
    );

  if (orders.length === 0)
    return <p className="center">No orders found.</p>;

  // ✅ Pagination buttons
  const pageButtons = [];
  for (let p = 1; p <= totalPages; p++) {
    pageButtons.push(
      <button
        key={p}
        className={p === page ? "active-page" : ""}
        onClick={() => handlePageClick(p)}
      >
        {p}
      </button>
    );
  }

  return (
    <div className="admin-orders-container">
      <h2>
        <InventoryIcon
          fontSize="medium"
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        />
        All Orders (Admin)
      </h2>
      <p className="total-revenue">Total Revenue: ₹{totalAmount}</p>

      {/* Desktop Table */}
      <div className="desktop-orders">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Details</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{desktopRows}</tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-orders">{mobileCards}</div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>
          <ArrowBackIcon fontSize="small" /> Previous
        </button>
        {pageButtons}
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next <ArrowForwardIcon fontSize="small" />
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        show={!!deleteOrderId}
        message="Are you sure you want to delete this order?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOrderId(null)}
      />
    </div>
  );
};

export default AllOrdersPage;
