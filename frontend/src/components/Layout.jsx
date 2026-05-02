import React, { use, useEffect } from "react";
import useLayoutStore from "../store/layoutStore";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import useThemeStore from "../store/themeStore";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "./Sidebar";
import Chatwindow from "../pages/chatSection/Chatwindow";






const Layout = ({
  children,
  isThemeDialogOpen,
  toggleThemeDialog,
  isStatusPreviewOpen,
  isStatusPreviewContent,
}) => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact,
  );
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} flex relative`}
    >
      {!isMobile && <SideBar />}

      <div
        className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col" : ""}`}
      >
        <AnimatePresence initial={false}>
          {(!selectedContact || !isMobile) && (
            <motion.div
              key="chatlist"
              initial={{ x: isMobile ? "-100%" : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%" }}
              transition={{ type:"tween" }}
              className={`w-full md:w-2/5 h-full ${isMobile ? "pb-16" : ""}`}
            >
              {children}
            </motion.div>
          )}

          {(selectedContact || !isMobile) && (
            <motion.div
              key="chatwindow"
              initial={{ x: isMobile ? "-100%" : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%" }}
              transition={{ type:"tween" }}
              className={`w-full  h-full `}
            >
             <Chatwindow 
             selectedContact={selectedContact}
             setSelectedContact={setSelectedContact}
             isMobile={isMobile}
             />
            </motion.div>
          )}


        </AnimatePresence>
      </div>

          {isMobile && <SideBar/>}

          {isThemeDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className={`${theme === "dark" ? "bg-[#202c33] text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg max-w-sm w-full`}>
                <h2 className="text-2xl font-semibold mb-4">Select Theme</h2>
                <div className="flex flex-col space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={theme === "light"}
                            onChange={() => setTheme("light")}
                            className="form-radio text-blue-600"
                        />
                        <span>light</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={theme === "dark"}
                            onChange={() => setTheme("dark")}
                            className="form-radio text-blue-600"
                        />
                        <span>dark</span>
                    </label>
                </div>
                <button
                    onClick={toggleThemeDialog}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Close
                </button>
            </div>
          </div>
          )}
          {isStatusPreviewOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              {isStatusPreviewContent}
            </div>
          )}
    </div>
  );
};

export default Layout;
