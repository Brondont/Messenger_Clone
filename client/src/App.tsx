import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/main/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const activeUserChat = { username: "Brogan", imagePath: "Somepath" };
  let routes;
  isAuth
    ? (routes = <Route path="/" element={<Home {...activeUserChat} />}></Route>)
    : (routes = (
        <>
          <Route path="login" element={<Login />}></Route>
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
