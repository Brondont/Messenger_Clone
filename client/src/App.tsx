import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";

import { AuthContext } from "./authContext";

import Home from "./pages/main/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import EditProfile from "./pages/auth/EditProfile";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [clientUser, setClientUser] = useState<User>();
  const location = useLocation();

  const rooturl = process.env.REACT_APP_ROOT_URL;

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

    fetch(rooturl + "/userContacts", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        return setUsers(
          resData.users.map((user: User) => {
            if (user.id.toString() === storedUserId) {
              setClientUser(user);
            }
            return { ...user };
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [location]);

  let routes;
  isAuth
    ? (routes = (
        <>
          <Route path="/m/:receiverId" element={<Home Users={users} />}></Route>
          <Route
            path="edit-profile"
            element={<EditProfile User={clientUser} />}
          ></Route>
          <Route path="*" element={<Navigate to={"/m/" + userId} />} />
        </>
      ))
    : (routes = (
        <>
          <Route
            path="/login"
            element={<Login setUserLogin={setUserLogin} />}
          ></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ));
  return (
    <div className="main">
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="error">
            <p>{error.message}</p>
            <button onClick={resetErrorBoundary}>Try again</button>
          </div>
        )}
      >
        <AuthContext.Provider value={{ logoutHandler }}>
          <Routes>{routes}</Routes>
        </AuthContext.Provider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
