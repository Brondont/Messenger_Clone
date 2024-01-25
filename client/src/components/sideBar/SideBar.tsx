import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SideBar.css";

import Usercard from "../userCard/UserCard";
import UserProfileDropdown from "../dropDown/UserProfileDropdown";
import Notifications from "../notifications/Notifications";
import UserSearch from "../userSearch/UserSearch";

import { AuthContext, AuthContextType } from "../../authContext";

import { User } from "../../userTypes";

const SideBar: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const navigate = useNavigate();

  const { clientUser } = useContext(AuthContext) as AuthContextType;

  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;

  return (
    <div className="main_sidebar">
      <div className="main_top">
        <h1> Chats </h1>
        <UserSearch />
      </div>
      <div className="user_messages">
        {Users.map((user: User) => {
          return (
            <Usercard
              key={user.id}
              user={user}
              lastMessage={true}
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
