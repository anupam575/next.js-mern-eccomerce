"use client";
export const dynamic = "force-dynamic"; // prevents prerender crash

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import API from "../../../utils/axiosInstance";
import "./CreateProduct.css";


const CreateProduct = () => {
  const router = useRouter();

  // ✅ Step 1: Stable form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Step 2: Safe category fetch (with cleanup)
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        if (mounted && data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Category Fetch Error:", err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Step 3: Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Step 4: Image handler (safeguarded)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    const previewsArr = [];

    files.forEach((file) => {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB`);
      } else if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(`${file.name} is not JPG/PNG`);
      } else {
        validFiles.push(file);
        previewsArr.push(URL.createObjectURL(file));
      }
    });

    setImages(validFiles);
    setPreviews(previewsArr);
  };

  // ✅ Step 5: Cloudinary Upload (100% safe)
  const uploadImagesToCloudinary = async () => {
    const uploaded = [];
    if (!images.length) return uploaded;

    try {
      const sigRes = await API.get("/get-signature");
      const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data;
      const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      for (const file of images) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("api_key", apiKey);
        uploadForm.append("timestamp", timestamp);
        uploadForm.append("signature", signature);
        uploadForm.append("folder", folder);

        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: uploadForm });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || "Cloudinary upload failed");
        }
        const data = await res.json();
        uploaded.push({ public_id: data.public_id, url: data.secure_url });
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      throw err;
    }

    return uploaded;
  };

  // ✅ Step 6: Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Product name is required");
    if (!formData.category) return toast.error("Please select a category");
    if (!images.length) return toast.error("Please select at least one image");

    try {
      setLoading(true);
      const uploadedImages = await uploadImagesToCloudinary();

      const payload = { ...formData, images: uploadedImages };
      const { data } = await API.post("/admin/product/new", payload);

      if (data.success) {
        toast.success("✅ Product created successfully!");
        setFormData({ name: "", description: "", price: "", category: "", stock: "" });
        setImages([]);
        setPreviews([]);
        router.push("/admin/products");
      } else {
        toast.error(data.message || "Failed to create product");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error(err.response?.data?.message || err.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 7: Render
  return (
    <div className="create-product-wrapper">
      <div className="create-product-container">
        <h2>Create New Product</h2>

        <form onSubmit={handleSubmit} className="create-product-form">
          {[
            { name: "name", label: "Product Name", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "price", label: "Price", type: "number" },
            { name: "stock", label: "Stock", type: "number" },
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          ))}

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              name="category"
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {previews.length > 0 && (
            <div className="preview-container">
              {previews.map((img, idx) => (
                <img key={idx} src={img} alt={`Preview ${idx}`} className="preview-image" />
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <div className="spinner-wrapper">
                <div className="spinner"></div>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
