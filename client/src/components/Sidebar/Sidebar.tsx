import React from "react";
import "./SideBar.css";

import Usercard from "../Usercard/Usercard";

type User = {
  username: string;
  imagePath: string;
  userId: string;
};

const SideBar: React.FC<{
  Users: User[];
  handleActiveUser: (userId: string) => void;
}> = ({ Users = [], handleActiveUser }) => {
  return (
    <div className="main_sidebar">
      <h1> Chats </h1>
      <div className="user_messages">
        {Users.map((user: User) => {
          return (
            <Usercard
              key={user.userId}
              onClick={() => {
                handleActiveUser(user.userId);
              }}
              {...user}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
