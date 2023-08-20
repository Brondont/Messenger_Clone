import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "./MainChat.css";

type User = {
  id: string;
  username: string;
  email: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  createdAt: string;
  sender_id: string;
  message: string;
  sentOn: string;
};

const MainChat: React.FC<{ Users: User[] }> = ({ Users = [] }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [activeUser, setActiveUser] = useState<User>();
  const [clientUser, setClientUser] = useState<User>();

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
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="main_chat">
      <div className="main_chat__user">
        {activeUser ? (
          <>
            <img
              alt={activeUser.username}
              className="main_chat__user_image"
              src={activeUser.imagePath}
            />
            <span className="main_chat__user_name">{activeUser.username}</span>{" "}
          </>
        ) : (
          <div></div>
        )}
      </div>
      <div className="main_chat__user_messages">
        {messages
          .slice(0)
          .reverse()
          .map((message) => {
            return message.sender_id.toString() === userId ? (
              <div className="main_chat__user_message_client_container">
                <div className="main_chat__user_message_client">
                  {message.message}
                </div>
              </div>
            ) : (
              <div className="main_chat__user_message_server">
                {message.message}
              </div>
            );
          })}
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
