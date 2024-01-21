import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../userCard/UserCard";
import UserProfileDropdown from "../dropDown/UserProfileDropdown";
import Notifications from "../notifications/Notifications";
import UserSearch from "../userSearch/UserSearch";

import { AuthContext, AuthContextType } from "../../authContext";

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

const SideBar: React.FC<{
  Users: User[];
  newestMessage: UserMessage[];
}> = ({ Users = [], newestMessage = [] }) => {
  const navigate = useNavigate();

  const { clientUser } = useContext(AuthContext) as AuthContextType;

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;
  const userId = localStorage.getItem("userId") as string;

  return (
    <div className="main_sidebar">
      <div className="main_top">
        <h1> Chats </h1>
        <UserSearch />
      </div>
      <div className="user_messages">
        {Users.map((user: User) => {
          const message = newestMessage.find((newMessage) => {
            return (
              newMessage &&
              ((newMessage.senderId.toString() === userId &&
                newMessage.receiverId.toString() === user.id.toString()) ||
                (newMessage.senderId.toString() === user.id.toString() &&
                  newMessage.receiverId.toString() === userId))
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
