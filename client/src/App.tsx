import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { AuthContext } from "./authContext";

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

  const logoutHandler = () => {
    setIsAuth(false);
    setToken("");
    setUserId("");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userId");
  };

  useEffect(() => {
    const token = localStorage.getItem("token") as string;
    const storedUserId = localStorage.getItem("userId") as string;
    const expiryDate = localStorage.getItem("expiryDate") as string;
    if (!token || !storedUserId) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }

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
      <AuthContext.Provider value={{ logoutHandler }}>
        <Routes>{routes}</Routes>
      </AuthContext.Provider>
    </div>
  );
};

export default App;
