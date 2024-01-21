import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import "./MainChat.css";

import UserCard from "../userCard/UserCard";
import Input from "../form/input/Input";

import FileOpenIcon from "../../public/images/blue-open-file.png";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: Date;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

const MainChat: React.FC<{
  Users: User[];
  setProfileIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewestMessages: React.Dispatch<React.SetStateAction<UserMessage[]>>;
}> = ({ Users = [], setProfileIsOpen, setNewestMessages }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [activeUser, setActiveUser] = useState<User>();
  const [messageCount, setMessageCount] = useState<number>(30);
  const [allMessagesRetrieved, setAllMessagesRetrieved] =
    useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const rootUrl = process.env.REACT_APP_ROOT_URL as string;
  const token = localStorage.getItem("token") as string;
  const userId = localStorage.getItem("userId") as string;

  const updateProfileIsOpen = () => {
    setProfileIsOpen((prev) => {
      return !prev;
    });
  };

  const loadMessages = useCallback(() => {
    fetch(rootUrl + "/m/" + activeUserWindow + "/" + messageCount, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        setMessages(resData.messages);
        setAllMessagesRetrieved(resData.allMessagesRetrieved);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeUserWindow, messageCount, rootUrl, token]);

  const handleMoreMessages = () => {
    setMessageCount((prevState) => {
      return prevState + 30;
    });
    loadMessages();
  };

  const handleFileContents: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setFiles((prevFile: File[]) => {
        return [...prevFile, file];
      });
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!activeUserWindow) {
      return;
    }

    setActiveUser(
      Users.find((user: User) => {
        return user.id.toString() === activeUserWindow;
      })
    );

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [Users, activeUserWindow, messages]);

  const sendUserMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!userMessage.length && !files.length) || !activeUserWindow) {
      return;
    }

    const formData = new FormData();

    formData.append("message", userMessage);
    formData.append("receiverId", activeUserWindow);
    files.forEach((file) => {
      formData.append("images", file);
    });

    fetch(rootUrl + "/send-message", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        // set the newest message
        setNewestMessages((prevMessages: UserMessage[]) => {
          return prevMessages.map((message: UserMessage) => {
            if (
              message &&
              ((message.senderId === +userId &&
                message.receiverId === +activeUserWindow) ||
                (message.senderId === +activeUserWindow &&
                  message.receiverId === +userId))
            ) {
              return {
                ...message,
                id: Math.random(),
                status: "sent",
                message: userMessage,
                createdAt: new Date(),
              };
            }
            return message;
          });
        });
        // reset
        setUserMessage("");
        setFiles([]);
        loadMessages();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  let prevSenderId: number | null = null;

  return (
    <div className="main-chat">
      {Users.length > 0 ? (
        <>
          <div className="main-chat__user">
            {activeUser ? (
              <>
                <UserCard user={activeUser} />
                <i
                  className="main-chat__user-options"
                  onClick={updateProfileIsOpen}
                >
                  . . .
                </i>
              </>
            ) : (
              <div> Loading user...</div>
            )}
          </div>
          <div className="main-chat__messages">
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
                      className={`main-chat__messages__message-container ${
                        isCurrentUser ? "sent-message" : "received-message"
                      }`}
                      key={message.id}
                    >
                      {showSenderName && (
                        <p
                          className={`main-chat__messages__sender-name ${
                            isCurrentUser ? "sent-message" : "received-message"
                          }`}
                        >
                          {isCurrentUser ? "You" : activeUser.username}
                        </p>
                      )}
                      <div
                        className={`main-chat__messages__message main-chat__messages__message-${
                          isCurrentUser ? "sent" : "received"
                        }`}
                      >
                        {message.message.includes("/images/") ? (
                          <img
                            className="main-chat__messages__message-image"
                            src={rootUrl + message.message}
                            alt="Pic"
                          />
                        ) : (
                          <p className="main-chat__message-text">
                            {message.message}
                          </p>
                        )}
                      </div>

                      {showSenderName && isCurrentUser && (
                        <div className="main-chat__messages__visibility">
                          {message.status}
                        </div>
                      )}
                    </div>
                  );
                })}
                {allMessagesRetrieved ? (
                  <div className="main-chat__messages__start">
                    Welcome to the start of ur conversations !
                  </div>
                ) : (
                  <>
                    {messageCount >= 30 && (
                      <div
                        className="main-chat__messages__more"
                        onClick={handleMoreMessages}
                      >
                        Click to load more messages...
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div>Loading messages...</div>
            )}
          </div>
          <div className="main-chat__form">
            {files.length > 0 && (
              <div className="  ">
                {files.map((file, index) => {
                  return (
                    <img
                      key={index}
                      className="main-chat__file--preview-image"
                      src={URL.createObjectURL(file)}
                      alt="uploadedImage"
                    />
                  );
                })}
                <button className="close-button" onClick={clearFiles}>
                  X
                </button>
              </div>
            )}
            <form className="main-chat__form" onSubmit={sendUserMessage}>
              <div className="main-chat__form--hidden-inputs">
                <label htmlFor="user_file_input">
                  <img
                    src={FileOpenIcon}
                    className="main-chat__form-button"
                    alt="fileupload"
                  />
                </label>
              </div>
              <input
                className="main-chat__form--input main-chat__form--input-file"
                name="user_file_input"
                type="file"
                id="user_file_input"
                onChange={handleFileContents}
              />
              <Input
                name="user_input"
                className="main-chat__form--input main-chat__form--input-text"
                type="text"
                placeholder="Aa"
                value={userMessage}
                onChange={setUserMessage}
                valid={true}
                required={true}
              />
            </form>
          </div>
        </>
      ) : (
        <div className="main-chat__no-friends">
          Add some friends to chat with !
        </div>
      )}
    </div>
  );
};

export default MainChat;
