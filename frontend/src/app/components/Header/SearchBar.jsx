"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchKeyword,
  clearSearchKeyword,
} from "../../../redux/slices/searchSlice";
import {
  fetchSuggestions,
  clearSuggestions,
} from "../../../redux/slices/suggestionsSlice";
import { useRouter } from "next/navigation";
import "./SearchBar.css";
import { IoSearchOutline, IoClose } from "react-icons/io5";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const suggestions = useSelector((state) => state?.suggestions?.list) || [];

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (keyword.trim()) {
      const timer = setTimeout(() => {
        dispatch(fetchSuggestions(keyword));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearSuggestions());
    }
  }, [keyword, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    dispatch(setSearchKeyword(trimmed));
    dispatch(clearSuggestions());
    router.push("/product");
  };

  const handleSelectSuggestion = (sugg) => {
    setKeyword(sugg.name);
    dispatch(setSearchKeyword(sugg.name));
    dispatch(clearSuggestions());
    router.push("/product");
  };

  const clearInput = () => {
    setKeyword("");
    dispatch(clearSearchKeyword());
    dispatch(clearSuggestions());
  };

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products"
          className="search-input"
          autoComplete="off"
          aria-label="Search products"
        />
        {keyword && (
          <button
            type="button"
            className="clear-button"
            onClick={clearInput}
            aria-label="Clear search"
          >
            <IoClose />
          </button>
        )}
        <button type="submit" className="search-button" aria-label="Search">
          <IoSearchOutline />
        </button>

        {suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((sugg) => (
              <li key={sugg._id} onClick={() => handleSelectSuggestion(sugg)}>
                {sugg.name}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
