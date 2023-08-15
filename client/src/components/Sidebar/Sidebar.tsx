import React from "react";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";

type User = {
  id: string;
  username: string;
  imagePath: string;
};

type SideBarProps = {
  Users: User[];
};

const SideBar: React.FC<SideBarProps> = ({ Users }) => {
  return (
    <div className="main_sidebar">
      <h1> Chats </h1>
      <div className="user_messages">
        {Users.map((user) => {
          return <Usercard {...user} />;
        })}
      </div>
    </div>
  );
};

export default SideBar;
