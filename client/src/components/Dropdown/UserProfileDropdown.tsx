import React, { useState, useContext } from "react";
import "./UserProfileDropdown.css";
import LogoutIcon from "../../public/images/logout.png";
import UserSettingsIcon from "../../public/images/profile-settings.png";

import { AuthContext, AuthContextType } from "../../authContext";

import Usercard from "../Usercard/Usercard";

type User = {
  id: string;
  username: string;
  email: string;
  imagePath: string;
  gender: string;
};

const UserProfileDropdown: React.FC<{ User: User | undefined }> = ({
  User,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileSettings = () => {};

  const { logoutHandler } = useContext(AuthContext) as AuthContextType;

  return (
    <div className="user-profile-dropdown">
      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-item-button" onClick={handleProfileSettings}>
            <img
              src={UserSettingsIcon}
              className="dropdown-item-icon"
              placeholder="settings"
            />
            <div className="dropdown-item-text">Profile Settings</div>
          </div>
          <div className="dropdown-item-button" onClick={logoutHandler}>
            <img
              src={LogoutIcon}
              className="dropdown-item-icon"
              placeholder="logout"
            />
            <div className="dropdown-item-text">Logout</div>
          </div>
        </div>
      )}
      <button className="dropdown-toggle" onClick={handleToggleDropdown}>
        <Usercard {...User!} />{" "}
      </button>
    </div>
  );
};

export default UserProfileDropdown;
