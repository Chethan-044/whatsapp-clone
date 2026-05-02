import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useThemeStore from "../store/themeStore";
import { useEffect } from "react";
import useLayoutStore from "../store/layoutStore";
import { FaCog, FaUser, FaUserCircle, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Chatwindow from "../pages/chatSection/Chatwindow";
import { LuCircleFadingPlus } from "react-icons/lu";






const Sidebar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, setTheme } = useThemeStore();
  const { user } = useLayoutStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();
  console.log(user)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "/status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/setting") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  if (isMobile && selectedContact) {
    return null;
  }

  const SidebarContent = (
    <>
      <Link to='/'
      className={`${isMobile ? "" : "mb-8" } ${activeTab === "chats" && "bg-gray-300 shadow-sm p-2 rounded-full"} focus:outline-none`}
      >
        <FaWhatsapp
          className={`h-6 w-6 ${activeTab === "chats" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        />
      </Link>

      
      <Link to='/status'
      className={`${isMobile ? "" : "mb-8" } ${activeTab === "status" && "bg-gray-300 shadow-sm p-2 rounded-full"} focus:outline-none`}
      >
        <LuCircleFadingPlus 

          className={`h-6 w-6 ${activeTab === "status" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        />
      </Link>
      {!isMobile && <div className="flex-grow"></div>}

       <Link to='/user-profile'
      className={`${isMobile ? "" : "mb-8" } ${activeTab === "profile" && "bg-gray-300 shadow-sm p-2 rounded-full"} focus:outline-none`}
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className={`h-6 w-6 ${activeTab === "profile" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          />
        ) : (
          <FaUserCircle
            className={`h-6 w-6 ${activeTab === "profile" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          />
        )}
      </Link>

       <Link to='/setting'
      className={`${isMobile ? "" : "mb-8" } ${activeTab === "setting" && "bg-gray-300 shadow-sm p-2 rounded-full"} focus:outline-none`}
      >
        <FaCog
          className={`h-6 w-6 ${activeTab === "setting" ? (theme === "dark" ? "text-gray-800" : "") : theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        />
      </Link>
    </>
  );

  return (
    <motion.div 
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
    transition={{duration: 0.5}}
    className={`${isMobile ? "fixed bottom-0 left-0  right-0 h-16" : "w-16 h-screen border-r-2"}
  ${theme === "dark" ? "bg-gray-900  border-gray-600" : "bg-[rgb(239,242,254)] border-gray-300"} bg-opacity-90 flex items-center py-4 shadow-lg
  ${isMobile ? "flex-row justify-around" : "flex-col justify-between" }
  `}
  
    >
      {SidebarContent }
    </motion.div>
  )
};

export default Sidebar;
