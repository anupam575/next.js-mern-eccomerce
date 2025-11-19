"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import API from "../../utils/axiosInstance";
import "./paymentPage.css";

// ✅ Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const cartItems = useSelector((state) => state.cart.items) || [];
  const shippingInfo = useSelector((state) => state.shipping.shippingInfo) || {};

  const [clientSecret, setClientSecret] = useState("");
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  // ✅ Get Stripe client secret from backend
  useEffect(() => {
    const getClientSecret = async () => {
      if (!cartItems.length) return;

      setLoading(true);
      try {
        // ✅ Match backend structure (product.price, quantity)
        const { data } = await API.post("/payment/process", {
          items: cartItems.map((item) => ({
            price: item.product?.price,
            quantity: item.quantity,
          })),
          shippingFee:
            cartItems.reduce(
              (acc, item) => acc + item.product?.price * item.quantity,
              0
            ) > 500
              ? 0
              : 50,
        });

        setClientSecret(data.client_secret);
        setOrderSummary(data.orderSummary);
      } catch (error) {
        console.error("Error creating payment intent:", error.response?.data || error.message);
        setPaymentError("Failed to create payment intent.");
        toast.error("⚠️ Failed to create payment intent");
      } finally {
        setLoading(false);
      }
    };

    getClientSecret();
  }, [cartItems]);

  // ✅ Handle Stripe Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaymentError("");
    setLoading(true);

    const card = elements.getElement(CardElement);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setPaymentError(result.error.message);
        toast.error(`❌ ${result.error.message}`);
      } else if (result.paymentIntent.status === "succeeded") {
        const paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
        };

        // ✅ Fully backend-matching order structure
        const orderData = {
          shippingInfo,
          orderItems: cartItems.map((item) => ({
            name: item.product?.name,
            quantity: item.quantity,
            image: item.product?.images?.[0]?.url,
            price: item.product?.price,
            product: item.product?._id,
          })),
          paymentInfo,
          itemsPrice: orderSummary?.itemsPrice || 0,
          taxPrice: orderSummary?.taxPrice || 0,
          shippingPrice: orderSummary?.shippingFee || 0,
          totalPrice: orderSummary?.totalPrice || 0,
        };

        try {
          const { data } = await API.post("/order/new", orderData);
          setOrderId(data.order._id);
          setPaymentSucceeded(true);
          toast.success("✅ Payment successful and order placed!");
        } catch (error) {
          console.error("Error placing order:", error.response?.data);
          setPaymentError("Order placement failed.");
          toast.error("❌ Payment done, but order placement failed!");
        }
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Payment failed.");
      toast.error("❌ Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Payment success UI
  if (paymentSucceeded) {
    return (
      <div className="payment-success-container">
        <h2>✅ Payment Successful!</h2>
        <button
          className="order-detail-btn"
          onClick={() => router.push(`/my-orders/${orderId}`)}
        >
          View Order Full Details
        </button>
      </div>
    );
  }

  // ✅ Payment form UI
  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {loading && <p className="loading-text">Processing...</p>}
      <CardElement className="card-element" options={{ hidePostalCode: true }} />
      {paymentError && <p className="payment-error">{paymentError}</p>}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="pay-button"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

// ✅ Main Payment Component
const PaymentPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="payment-container">
        <h2>Payment</h2>
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default PaymentPage;
