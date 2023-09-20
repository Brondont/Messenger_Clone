import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./UserProfileDropdown.css";
import LogoutIcon from "../../public/images/logout.png";
import UserSettingsIcon from "../../public/images/profile-settings.png";

import { AuthContext, AuthContextType } from "../../authContext";

import Usercard from "../usercard/Usercard";

type User = {
  id: number;
  username: string;
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

  const { logoutHandler } = useContext(AuthContext) as AuthContextType;

  return (
    <div className="user-profile-dropdown">
      {isOpen && (
        <div className="dropdown-content">
          <Link
            className="dropdown-item-button"
            to={{ pathname: "/edit-profile/" }}
          >
            <img
              src={UserSettingsIcon}
              className="dropdown-item-icon"
              placeholder="settings"
            />
            <div className="dropdown-item-text">Profile Settings</div>
          </Link>
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
      <Usercard user={User} onClick={handleToggleDropdown} />
    </div>
  );
};

export default UserProfileDropdown;
