import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";
import UserProfileDropdown from "../Dropdown/UserProfileDropdown";

type User = {
  id: string;
  username: string;
  email: string;
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
      <h1> Chats </h1>
      <div className="user_messages">
        {Users.map((user: User) => {
          return (
            <Link to={"/m/" + user.id} key={user.id}>
              <Usercard key={user.id} {...user} />
            </Link>
          );
        })}
      </div>
      <UserProfileDropdown User={clientUser} />
    </div>
  );
};

export default SideBar;
