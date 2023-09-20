import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../usercard/Usercard";
import UserProfileDropdown from "../Dropdown/UserProfileDropdown";
import Notifications from "../notifications/Notifications";
import UserSearch from "../userSearch/UserSearch";

import { AuthContext, AuthContextType } from "../../authContext";

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

const SideBar: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const [lastUserMessages, setLastUserMessages] = useState<UserMessage[]>([]);
  const navigate = useNavigate();

  const { clientUser } = useContext(AuthContext) as AuthContextType;
  const { socket } = useContext(AuthContext) as AuthContextType;

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const rooturl = process.env.REACT_APP_ROOT_URL;

  useEffect(() => {
    if (!Users || !socket) {
      return;
    }
    setLastUserMessages(
      Users.flatMap((user: User) => {
        return user.ReceivedMessages.flatMap((receivedMessage: UserMessage) => {
          return user.SentMessages.map((sentMessage: UserMessage) => {
            return receivedMessage.id > sentMessage.id
              ? receivedMessage
              : sentMessage;
          });
        });
      })
    );
    socket.on("newMessage", (newMessage: UserMessage) => {
      setLastUserMessages(
        Users.flatMap((user: User) => {
          return user.ReceivedMessages.flatMap(
            (receivedMessage: UserMessage) => {
              return user.SentMessages.map((sentMessage: UserMessage) => {
                if (
                  newMessage.senderId.toString() === user.id.toString() ||
                  newMessage.receiverId.toString() === user.id.toString()
                ) {
                  return newMessage;
                }
                return receivedMessage.id > sentMessage.id
                  ? receivedMessage
                  : sentMessage;
              });
            }
          );
        })
      );
    });

    socket.on("seenMessage", ({ receiverId, senderId }) => {
      setLastUserMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (
            receiverId === message.receiverId.toString() &&
            senderId === message.senderId.toString()
          ) {
            message.status = "seen";
            return message;
          }
          return message;
        });
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [Users, rooturl, token, socket]);

  return (
    <div className="main_sidebar">
      <div className="main_top">
        <h1> Chats </h1>
        <UserSearch />
      </div>
      <div className="user_messages">
        {Users.map((user: User) => {
          let message = lastUserMessages.find((message) => {
            if (user.id.toString() === userId) {
              return false;
            }
            return (
              message.senderId.toString() === user.id.toString() ||
              message.receiverId.toString() === user.id.toString()
            );
          });
          return (
            <Usercard
              key={user.id}
              user={user}
              lastMessage={message}
              onClick={() => {
                if (activeUserWindow === user.id.toString()) {
                  return;
                }
                navigate("/m/" + user.id);
              }}
            />
          );
        })}
      </div>
      <div className="main_bottom">
        <UserProfileDropdown User={clientUser} />
        <Notifications />
      </div>
    </div>
  );
};

export default SideBar;
