 import { useState } from "react";
import Link from "next/link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./style/drop.css"; // normal CSS import

export default function ThreeDotDropdown() {
  const [show, setShow] = useState(false);

  const handleMouseEnter = () => setShow(true);
  const handleMouseLeave = () => setShow(false);

  return (
    <div
      className="dropdownContainer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3-dot icon using MUI */}
      <div className="icon">
        <MoreVertIcon />
      </div>

      {/* Dropdown menu */}
      {show && (
        <div className="menu">
          {/* Navigate to Notification page */}
          <Link href="/notification">
            <a>Notifications</a>
          </Link>

          <Link href="/option2">
            <a>Option 2</a>
          </Link>

          <Link href="/option3">
            <a>Option 3</a>
          </Link>
        </div>
      )}
    </div>
  );
}
