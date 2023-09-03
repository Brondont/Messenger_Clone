import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";
import UserProfileDropdown from "../Dropdown/UserProfileDropdown";
import Notifications from "../Notifications/Notifications";
import UserSearch from "../UserSearch/UserSearch";

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
  sentOn: string;
};

const SideBar: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const [lastUserMessages, setLastUserMessages] = useState<UserMessage[]>([]);

  const { clientUser } = useContext(AuthContext) as AuthContextType;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const rooturl = process.env.REACT_APP_ROOT_URL;

  useEffect(() => {
    if (!Users) {
      return;
    }
    setLastUserMessages(
      Users.flatMap((user) => {
        return user.ReceivedMessages.flatMap((receivedMessage) => {
          return user.SentMessages.map((sentMessage) => {
            return receivedMessage.id > sentMessage.id
              ? receivedMessage
              : sentMessage;
          });
        });
      })
    );
  }, [Users, rooturl, token]);

  return (
    <div className="main_sidebar">
      <div className="main_top">
        <h1> Chats </h1>
        <UserSearch />
      </div>
      <div className="user_messages">
        {Users.map((user: User) => {
          let message = lastUserMessages.find((message) => {
            return (
              message.senderId === user.id || message.receiverId === user.id
            );
          });
          return (
            <Link to={"/m/" + user.id} key={user.id}>
              <Usercard key={user.id} user={user} lastMessage={message} />
            </Link>
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
