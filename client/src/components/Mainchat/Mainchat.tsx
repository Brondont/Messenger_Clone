import React, { useState, useEffect, ChangeEvent, useContext } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "./MainChat.css";

import { AuthContext, AuthContextType } from "../../authContext";

import Usercard from "../Usercard/Usercard";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentOn: string;
};

const MainChat: React.FC<{ Users: User[] }> = ({ Users = [] }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [activeUser, setActiveUser] = useState<User>();

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const rooturl = process.env.REACT_APP_ROOT_URL as string;
  const token = localStorage.getItem("token") as string;
  const userId = localStorage.getItem("userId") as string;

  const { socket } = useContext(AuthContext) as AuthContextType;

  const updateUserMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const loadMessages = () => {
    fetch(rooturl + "/m/" + activeUserWindow, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        return setMessages(resData.messages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (!activeUserWindow) {
      return;
    }

    loadMessages();
    setActiveUser(
      Users.find((user: User) => {
        return user.id.toString() === activeUserWindow;
      })
    );

    if (!socket) {
      return;
    }
    socket.on("newMessage", (message: UserMessage) => {
      if (
        (activeUserWindow === message.receiverId.toString() &&
          userId === message.senderId.toString()) ||
        (userId === message.receiverId.toString() &&
          activeUserWindow === message.senderId.toString())
      ) {
        console.log("this ran");
        setMessages((prevMessages) => {
          return [message, ...prevMessages];
        });
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [activeUserWindow, Users]);

  const sendUserMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userMessage.length) {
      return;
    }
    const userMessageDetails = {
      message: userMessage,
      receiverId: activeUserWindow,
    };
    fetch(rooturl + "/send-message", {
      method: "POST",
      body: JSON.stringify(userMessageDetails),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        setUserMessage("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  let prevSenderId: number | null = null;

  return (
    <div className="main_chat">
      {Users.length > 0 ? (
        <>
          <div className="main_chat__user">
            {activeUser ? (
              <>
                <Usercard user={activeUser} />
              </>
            ) : (
              <div> Loading user...</div>
            )}
          </div>
          <div className="main_chat__user_messages">
            {activeUser ? (
              <>
                {messages.map((message) => {
                  const isCurrentUser = message.senderId.toString() === userId;
                  const showSenderName = prevSenderId !== message.senderId;

                  if (showSenderName) {
                    prevSenderId = message.senderId;
                  }

                  return (
                    <div
                      className={`main_chat__user_message_${
                        isCurrentUser ? "client" : "server"
                      }_container`}
                      key={message.id}
                    >
                      {showSenderName && (
                        <p
                          className={`message_${
                            isCurrentUser ? "client" : "server"
                          }__name`}
                        >
                          {isCurrentUser ? "You" : activeUser.username}
                        </p>
                      )}
                      <div
                        className={`main_chat__user_message_${
                          isCurrentUser ? "client" : "server"
                        }`}
                      >
                        {message.message}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div>Loading messages...</div>
            )}
          </div>
          <div className="main_chat__user_input">
            <form onSubmit={sendUserMessage}>
              <input
                className="user_input"
                name="user_input"
                type="text"
                placeholder="Aa"
                value={userMessage}
                onChange={updateUserMessage}
              />
            </form>
          </div>
        </>
      ) : (
        <div className="user-no-friends"> Add some friends to chat with !</div>
      )}
    </div>
  );
};

export default MainChat;
