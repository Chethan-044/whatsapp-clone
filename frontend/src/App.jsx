import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/user-login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PublicRoute,ProtectedRoute } from "./Protected";
import HomePage from "./components/HomePage";
import { useState } from "react";
import userDetails from "./components/userDetails";
import Status from "./pages/StatusSection/Status";
import Setting from "./pages/SettingSection/Setting";



const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
        <Router>
          <Routes>

            <Route element={<PublicRoute />}>
                    <Route path="/user-login" element={<Login />} />

            </Route>

            <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/user-profile" element={<userDetails/>} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/setting" element={<Setting />} />
            </Route>


          </Routes>
        </Router>
    </>
  );
};

export default App;
