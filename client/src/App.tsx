import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import socketIOClient, { Socket } from "socket.io-client";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";

import { AuthContext } from "./authContext";

import Home from "./pages/main/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import EditProfile from "./pages/auth/EditProfile";
import ResetPassword from "./pages/auth/PasswordReset";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
  ReceivedMessages: UserMessage[];
  SentMessages: UserMessage[];
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [clientUser, setClientUser] = useState<User>();
  const [socket, setSocket] = useState<Socket>();
  const navigate = useNavigate();
  const location = useLocation();

  const rooturl = process.env.REACT_APP_ROOT_URL as string;

  const setUserLogin = (userId: string, token: string) => {
    setUserId(userId);
    setIsAuth(true);
  };

  const logoutHandler = () => {
    setIsAuth(false);
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
        setUsers(
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

    const newSocket: Socket = socketIOClient(rooturl, {
      query: {
        token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected.");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected.");
    });

    setSocket(newSocket);

    return () => {
      setSocket(newSocket.disconnect());
    };
  }, [location, rooturl]);

  const handleUsers = (user: User, action: string) => {
    switch (action) {
      case "ADD": {
        setUsers((prevState) => {
          return [...prevState, user];
        });
        break;
      }
      case "REMOVE": {
        if (userId !== user.id.toString()) {
          navigate(userId);
          setUsers((prevState) => {
            return prevState.filter((prevUser) => {
              return prevUser.id.toString() !== user.id.toString();
            });
          });
        }
        break;
      }
      default: {
        throw new Error("Invalid user action.");
      }
    }
  };

  let routes;
  isAuth
    ? (routes = (
        <>
          <Route
            path="/m/:receiverId"
            element={
              <Home Users={users} handleUsers={handleUsers} socket={socket} />
            }
          ></Route>
          <Route
            path="/edit-profile"
            element={<EditProfile User={clientUser} />}
          ></Route>
          <Route path="/reset-password" element={<ResetPassword />}></Route>
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
          <Route path="/reset-password" element={<ResetPassword />}></Route>
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
        <AuthContext.Provider value={{ logoutHandler, clientUser, socket }}>
          <Routes>{routes}</Routes>
        </AuthContext.Provider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
