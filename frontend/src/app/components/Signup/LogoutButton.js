import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import { clearUser, setLoading } from "../../../redux/slices/authSlice";
import "../../me/MyProfile.css";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));

      await API.post("/logout");

      dispatch(clearUser());
      localStorage.removeItem("user");

      toast.success("✅ Logged out successfully");

      router.push("/");
    } catch (error) {
      console.error("❌ Logout error:", error.response?.data || error.message);
      toast.error("Logout failed, please try again.");
      dispatch(setLoading(false));
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
       Logout
    </button>
  );
};

export default LogoutButton;
