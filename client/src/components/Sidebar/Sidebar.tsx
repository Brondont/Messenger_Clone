import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";
import UserProfileDropdown from "../Dropdown/UserProfileDropdown";
import Notifications from "../Notifications/Notifications";
import UserSearch from "../UserSearch/UserSearch";

import { AuthContext, AuthContextType } from "../../authContext";

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
  receiverId: number;
  message: string;
  sentOn: string;
};

const SideBar: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const [lastUserMessages, setLastUserMessages] = useState<UserMessage[]>();

  const { clientUser } = useContext(AuthContext) as AuthContextType;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const rooturl = process.env.REACT_APP_ROOT_URL;

  useEffect(() => {
    if (!Users) {
      return;
    }
    fetch(rooturl + "/m/lastUserMessages", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch((err) => {
        throw err;
      });
  }, [Users, rooturl, token]);

  return (
    <div className="main_sidebar">
      <div className="main_top">
        <h1> Chats </h1>
        <UserSearch />
      </div>
      <div className="user_messages">
        {Users.map((user: User) => {
          return (
            <Link to={"/m/" + user.id} key={user.id}>
              <Usercard key={user.id} user={user} />
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
