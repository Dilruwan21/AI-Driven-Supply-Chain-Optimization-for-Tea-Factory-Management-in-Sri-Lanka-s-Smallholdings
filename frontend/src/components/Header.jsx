import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const [activeLink, setActiveLink] = useState(null);
  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleHomeClick = () => {
    navigate("/");
    setActiveLink("home");
  };

  const handleLogout = () => {
    // Example: localStorage.removeItem('authToken');
    navigate("/");
  };

  return (
    <nav className="absolute top-0 left-0 right-0 bg-transparent p-4 flex items-center justify-between z-50">
      {/* Logo Section */}
      <div
        className="flex items-center cursor-pointer group"
        onClick={handleHomeClick}
      >
        <img
          src={logo}
          alt="Tea Factory Logo"
          className={`h-14 w-14 mr-3 rounded-full transition-transform duration-300 ${
            activeLink === "home" ? "scale-110" : "group-hover:scale-110"
          }`}
        />
        <h1
          className={`text-white text-2xl font-bold relative group ${
            activeLink === "home" ? "scale-105" : ""
          } transition-all duration-300`}
        >
          Tea Factory Management
          <span
            className={`block absolute left-0 bg-white h-1 ${
              activeLink === "home" ? "w-full" : "w-0 group-hover:w-full"
            } transition-all duration-300`}
          ></span>
        </h1>
      </div>

      {/* Navigation Links & Dropdown */}
      <div className="flex items-center space-x-10">
        <div className="hidden md:flex space-x-10">
          <a
            href="/AboutUs"
            className={`text-white text-xl font-bold relative group ${
              activeLink === "about" ? "scale-105" : ""
            } transition-all duration-300`}
            onClick={() => handleLinkClick("about")}
          >
            About Us
            <span
              className={`block absolute left-0 bg-white h-1 ${
                activeLink === "about" ? "w-full" : "w-0 group-hover:w-full"
              } transition-all duration-300`}
            ></span>
          </a>
          <a
            href="/ContactUs"
            className={`text-white text-xl font-bold relative group ${
              activeLink === "contact" ? "scale-105" : ""
            } transition-all duration-300`}
            onClick={() => handleLinkClick("contact")}
          >
            Contact Us
            <span
              className={`block absolute left-0 bg-white h-1 ${
                activeLink === "contact" ? "w-full" : "w-0 group-hover:w-full"
              } transition-all duration-300`}
            ></span>
          </a>
        </div>

        {/* Dropdown Menu */}
        <Dropdown>
          <Dropdown.Toggle
            variant="link"
            className="text-white text-xl font-bold px-4 py-2 hover:text-gray-300 focus:outline-none transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white rounded-lg"
          >
            LOGIN
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg border rounded-lg bg-white min-w-[180px] mt-2 p-1">
            <Dropdown.Item
              href="/login/factory-manager"
              className="text-sm font-medium py-2 px-3 transition-all duration-200 hover:bg-gray-100 rounded"
            >
              Factory Manager
            </Dropdown.Item>
            <Dropdown.Item
              href="/login/tea-garden-owner"
              className="text-sm font-medium py-2 px-3 transition-all duration-200 hover:bg-gray-100 rounded"
            >
              Tea Garden Owner
            </Dropdown.Item>
            <Dropdown.Item
              href="/Trasport_login"
              className="text-sm font-medium py-2 px-3 transition-all duration-200 hover:bg-gray-100 rounded"
            >
              Transport Operators
            </Dropdown.Item>
            <Dropdown.Divider className="my-1 border-gray-300" />
            <Dropdown.Item
              onClick={handleLogout}
              className="text-sm font-bold text-red-600 py-2 px-3 transition-all duration-200 hover:bg-red-100 rounded"
            >
              LOGOUT
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Header;
