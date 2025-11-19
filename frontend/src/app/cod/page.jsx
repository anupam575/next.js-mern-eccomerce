"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import API from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import "./cod.css";

const CODPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cartItems = useSelector((state) => state.cart.items) || [];
  const shippingInfo = useSelector((state) => state.shipping.shippingInfo) || {};

  const handleCOD = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingInfo,
        orderItems: cartItems.map((item) => ({
          name: item.product?.name,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url,
          price: item.product?.price,
          product: item.product?._id,
        })),
        paymentInfo: {
          id: `COD_${Date.now()}`,
          status: "Cash on Delivery",
        },
        itemsPrice: cartItems.reduce(
          (acc, item) => acc + item.product?.price * item.quantity,
          0
        ),
        taxPrice: 0,
        shippingPrice:
          cartItems.reduce(
            (acc, item) => acc + item.product?.price * item.quantity,
            0
          ) > 500
            ? 0
            : 50,
        totalPrice:
          cartItems.reduce(
            (acc, item) => acc + item.product?.price * item.quantity,
            0
          ) +
          (cartItems.reduce(
            (acc, item) => acc + item.product?.price * item.quantity,
            0
          ) > 500
            ? 0
            : 50),
      };

      const { data } = await API.post("/order/new", orderData);

      toast.success(" Order placed successfully!");

      router.push(`/cod/order-success/${data.order._id}`);
    } catch (error) {
      console.error("COD Error:", error);
      toast.error(error.response?.data?.message || "❌ Failed to place order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cod-container">
      <h2>Cash on Delivery</h2>
      <p>Review your details and place your order.</p>

      <button onClick={handleCOD} disabled={loading} className="cod-btn">
        {loading ? "Placing Order..." : "Place Order (COD)"}
      </button>
    </div>
  );
};

export default CODPage;
