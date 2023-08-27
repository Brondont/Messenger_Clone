import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "./MainChat.css";

import Usercard from "../Usercard/Usercard";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  message: string;
  sentOn: string;
};

const MainChat: React.FC<{ Users: User[] }> = ({ Users = [] }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [activeUser, setActiveUser] = useState<User>();

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const rooturl = process.env.REACT_APP_ROOT_URL || "";
  const token = localStorage.getItem("token") as string;
  const userId = localStorage.getItem("userId") as string;

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
    const socket = socketIOClient(rooturl);

    const newMessageListener = (message: UserMessage) => {
      setMessages((prevMessages) => {
        return [...prevMessages, message];
      });
    };
    socket.on("newMessage", newMessageListener);

    if (activeUserWindow) {
      loadMessages();
      setActiveUser(
        Users.find((user: User) => {
          return user.id.toString() === activeUserWindow;
        })
      );
    }

    return () => {
      socket.off("newMessage", newMessageListener);
      socket.disconnect();
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
            {messages
              .slice(0)
              .reverse()
              .map((message) => {
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
    </div>
  );
};

export default MainChat;
