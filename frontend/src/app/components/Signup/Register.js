"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import "./register.css";

// ✅ MUI Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  avatar: null,
};

function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputFields = [
    { name: "name", type: "text", label: "Name", placeholder: "Enter your name" },
    { name: "email", type: "email", label: "Email", placeholder: "Enter your email" },
    { name: "password", type: "password", label: "Password", placeholder: "Enter password" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.warn("Only JPG/PNG images allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warn("Photo must be < 10MB");
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: file }));

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isPasswordStrong = (pwd) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  const uploadToCloudinary = async (file) => {
    try {
      const { signature, timestamp, folder, cloudName, apiKey } = await API.get(
        "/get-signature"
      ).then((res) => res.data);

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("folder", folder);
      uploadData.append("timestamp", timestamp);
      uploadData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await res.json();
      if (!data.secure_url || !data.public_id)
        throw new Error(data.error?.message || "Upload failed");

      return { url: data.secure_url, public_id: data.public_id };
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, password, avatar } = formData;

    if (!name || !email || !password) {
      toast.warn("All fields required");
      setLoading(false);
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.warn(
        "Password must include uppercase, lowercase, number & special character"
      );
      setLoading(false);
      return;
    }

    try {
      let avatarData = null;
      if (avatar) avatarData = await uploadToCloudinary(avatar);

      const { data } = await API.post("/register", {
        name,
        email,
        password,
        avatar: avatarData,
      });

      toast.success(data.message || "Registration successful!");
      setFormData(initialFormData);
      setPreview(null);
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Create an Account</h2>

        {inputFields.map((field) => (
          <div key={field.name} className="input-group">
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === "password" ? (
              <div className="password-wrapper">
                <input
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}

        <label htmlFor="avatar" className="upload-label">
          <CloudUploadIcon fontSize="small" /> Upload Avatar (optional)
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />

        {preview && <img src={preview} alt="Avatar preview" className="avatar-preview" />}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? <span className="spinner"></span> : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
