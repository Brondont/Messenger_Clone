import React from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";

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
    </div>
  );
};

export default SideBar;
