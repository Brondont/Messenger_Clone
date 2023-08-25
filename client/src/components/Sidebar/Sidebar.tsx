import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";
import UserProfileDropdown from "../Dropdown/UserProfileDropdown";
import Notifications from "../Notifications/Notifications";
import UserSearch from "../UserSearch/UserSearch";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

const SideBar: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const [clientUser, setClientUser] = useState<User>();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setClientUser(Users.find((user) => user.id.toString() === userId));
  }, [Users]);

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
