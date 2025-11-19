"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import API from "../../utils/axiosInstance";

import PriceSlider from "../components/Section/Slider"; // folder structure ke hisaab se adjust kare
import "./Product.css";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [debouncedPriceRange] = useDebounce(priceRange, 300);

  const keyword = useSelector((state) => state?.search?.keyword) || "";
  const [debouncedKeyword] = useDebounce(keyword, 300);

  const router = useRouter();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, debouncedPriceRange]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/products?page=${page}`;
      if (debouncedKeyword.trim()) query += `&keyword=${debouncedKeyword.trim()}`;
      query += `&price[gte]=${debouncedPriceRange[0]}&price[lte]=${debouncedPriceRange[1]}`;

      const { data } = await API.get(query);

      setProducts(data.products || []);
      const total = data.filteredProductsCount || 0;
      const perPage = data.resultPerPage || 1;
      setTotalPages(Math.ceil(total / perPage));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load products";
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, debouncedPriceRange, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <p className="loading">Loading…</p>;

  return (
    <div className="product-page">
      <h1 className="page-title">
        All Products <FilterAltIcon className="filter-icon" />
      </h1>

      <div className="page-layout">
        {/* LEFT FILTER PANEL */}
        <div className="left-filters">
          <h2 className="filter-heading">Filters</h2>

          <div className="filter-box">
            <p className="filter-label">Price</p>
            <PriceSlider
              value={priceRange}
              onChange={(e, val) => setPriceRange(val)}
              onChangeCommitted={() => fetchProducts()}
            />
            <div className="price-values">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PRODUCT GRID */}
        <div className="right-products">
          <div className="product-grid">
            {products.length === 0 && <p className="no-products">No products found 😞</p>}

            {products.map((p) => (
              <div
                key={p._id}
                className="product-card"
                onClick={() => router.push(`/product/${encodeURIComponent(p._id)}`)}
              >
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  className="product-image"
                />
                <h3 className="product-name">{p.name}</h3>
                <p className="price">₹{p.price}</p>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="pagination-numbers">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ArrowBackIosNewIcon /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`page-btn ${page === num ? "active" : ""}`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next <ArrowForwardIosIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
