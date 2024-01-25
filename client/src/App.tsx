import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import socketIOClient, { Socket } from "socket.io-client";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";

import { AuthContext } from "./authContext";

import Home from "./pages/main/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import EditProfile from "./pages/auth/EditProfile";
import ResetPassword from "./pages/auth/PasswordReset";

import { User, UserMessage } from "./userTypes";

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [clientUser, setClientUser] = useState<User>();
  const [socket, setSocket] = useState<Socket>();
  const navigate = useNavigate();

  const rootUrl = process.env.REACT_APP_ROOT_URL as string;

  const setUserLogin = (userId: string) => {
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
    setUserLogin(storedUserId);

    let newUsers = [] as User[];
    fetch(rootUrl + "/userContacts", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        newUsers = resData.users;
        return fetch(rootUrl + "/newestMessages", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        const newestMessages = resData.newestMessages;

        // attach newest messages to each user
        newestMessages.forEach((newestMessage: UserMessage) => {
          newUsers = newUsers.map((user) => {
            const message = newestMessages.find((newMessage: UserMessage) => {
              return (
                newMessage &&
                ((newMessage.senderId.toString() === userId &&
                  newMessage.receiverId.toString() === user.id.toString()) ||
                  (newMessage.senderId.toString() === user.id.toString() &&
                    newMessage.receiverId.toString() === userId))
              );
            });
            return { ...user, message };
          });
        });

        //sort users depending on last message time
        newUsers.sort((userA, userB) => {
          const createdAtA = userA.message?.createdAt;
          const createdAtB = userB.message?.createdAt;

          const dateA = createdAtA ? new Date(createdAtA) : null;
          const dateB = createdAtB ? new Date(createdAtB) : null;

          if (dateA && dateB) {
            return dateB.getTime() - dateA.getTime();
          } else if (dateA) {
            return -1;
          } else if (dateB) {
            return 1;
          } else {
            return 0;
          }
        });

        setClientUser(
          newUsers.find((user) => {
            return user.id.toString() === userId;
          })
        );
        setUsers(newUsers);
      })
      .catch((err) => {
        console.log(err);
      });

    const newSocket: Socket = socketIOClient(rootUrl, {
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
      newSocket.disconnect();
    };
  }, [rootUrl, userId]);

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

  const updateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  let routes;
  isAuth
    ? (routes = (
        <>
          <Route
            path="/m/:receiverId"
            element={
              <Home
                Users={users}
                updateUsers={updateUsers}
                handleUsers={handleUsers}
                socket={socket}
              />
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
