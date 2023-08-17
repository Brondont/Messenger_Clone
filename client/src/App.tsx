import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/main/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const setUserLogin = (userId: string, token: string) => {
    setToken(token);
    setUserId(userId);
    setIsAuth(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (!token || !storedUserId) return;
    setUserLogin(storedUserId, token);
  });

  let routes;
  isAuth
    ? (routes = (
        <>
          <Route
            path="/m/:receiverId"
            element={<Home userId={userId} token={token} />}
          ></Route>
          <Route path="*" element={<Navigate to={"/m/" + userId} />} />
        </>
      ))
    : (routes = (
        <>
          <Route
            path="login"
            element={<Login setUserLogin={setUserLogin} />}
          ></Route>
          <Route path="signup" element={<Signup />}></Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ));
  return (
    <div className="main">
      <Routes>{routes}</Routes>
    </div>
  );
};

export default App;
