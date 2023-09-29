import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./MainChat.css";

import { AuthContext, AuthContextType } from "../../authContext";

import Usercard from "../Usercard/Usercard";
import Input from "../Form/Input/Input";

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
  status: string;
};

const MainChat: React.FC<{ Users: User[] }> = ({ Users = [] }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [activeUser, setActiveUser] = useState<User>();
  const [profileIsOpen, setProfileIsOpen] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(30);
  const [allMessagesRetrieved, setAllMessagesRetrieved] =
    useState<boolean>(false);

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const rooturl = process.env.REACT_APP_ROOT_URL as string;
  const token = localStorage.getItem("token") as string;
  const userId = localStorage.getItem("userId") as string;

  const { socket } = useContext(AuthContext) as AuthContextType;

  const updateUserMessage = (value: string, name: string) => {
    setUserMessage(value);
  };

  const updateProfileIsOpen = () => {
    setProfileIsOpen((prevState) => {
      return !prevState;
    });
  };

  const loadMessages = useCallback(() => {
    fetch(rooturl + "/m/" + activeUserWindow + "/" + messageCount, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        setMessages(resData.messages);
        setAllMessagesRetrieved(resData.allMessagesRetrieved);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeUserWindow, messageCount, rooturl, token]);

  const handleMoreMessages = () => {
    setMessageCount((prevState) => {
      return prevState + 30;
    });
    loadMessages();
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
        setMessages((prevMessages: UserMessage[]) => {
          return [
            message,
            ...prevMessages.map((message) => {
              return { ...message, status: "seen" };
            }),
          ];
        });
      }
    });

    socket.on("seenMessage", () => {
      setMessages((prevMessages: UserMessage[]) => {
        return prevMessages.map((message: UserMessage) => {
          if (message.senderId.toString() === activeUserWindow) {
            return message;
          }
          return { ...message, status: "seen" };
        });
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [activeUserWindow, Users, messageCount, loadMessages, socket, userId]);

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
                <Usercard user={activeUser} onClick={updateProfileIsOpen} />
                {profileIsOpen && (
                  <div className="main_chat__user_profile">
                    <Usercard
                      user={activeUser}
                      options={{ isFriendProfile: true, onHover: false }}
                    />
                  </div>
                )}
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
                      {showSenderName && isCurrentUser && (
                        <div className="message__seen">{message.status}</div>
                      )}
                    </div>
                  );
                })}
                {allMessagesRetrieved ? (
                  <div className="main_chat__user-messages-start">
                    Welcome to the start of ur conversations !
                  </div>
                ) : (
                  <>
                    {messageCount >= 30 && (
                      <div
                        className="main_chat__user-load-more"
                        onClick={handleMoreMessages}
                      >
                        Load more messages...
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div>Loading messages...</div>
            )}
          </div>
          <div className="main_chat__user_input">
            <form onSubmit={sendUserMessage}>
              <Input
                name="user_input"
                className="user_input"
                type="text"
                placeholder="Aa"
                value={userMessage}
                onChange={updateUserMessage}
                valid={true}
                required={true}
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
