import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import socketIOClient from "socket.io-client";
import "./MainChat.css";

type User = {
  username: string;
  imagePath: string;
};

type UserMessage = {
  message: string;
  sentOn: string;
};

const MainChat: React.FC<User> = (props) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);

  const rooturl = process.env.REACT_APP_ROOT_URL || "";

  const updateUserMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const loadMessages = useCallback(() => {
    fetch(rooturl + "messages")
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        return setMessages(resData.messages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [rooturl]);

  useEffect(() => {
    const socket = socketIOClient(rooturl);

    const newMessageListener = (message: UserMessage) => {
      setMessages((prevMessages) => {
        return [...prevMessages, message];
      });
    };
    socket.on("newMessage", newMessageListener);

    loadMessages();

    return () => {
      socket.off("newMessage", newMessageListener);
      socket.disconnect();
    };
  }, [loadMessages, rooturl]);

  const sendUserMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessageDetails = {
      message: userMessage,
      sentOn: new Date().toISOString(),
    };
    fetch(rooturl + "send-message", {
      method: "POST",
      body: JSON.stringify(userMessageDetails),
      headers: {
        "Content-Type": "application/json",
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
        <img
          alt={props.username}
          className="main_chat__user_name"
          src={props.imagePath}
        />
        <span className="main_chat__user_name">{props.username}</span>
      </div>
      <div className="main_chat__user_messages">
        {messages.map((message) => {
          return <div>{message.message}</div>;
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
