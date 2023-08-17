import React from "react";
import "./Usercard.css";

type User = {
  username: string;
  imagePath: string;
};

const Usercard: React.FC<User> = ({ username, imagePath }) => {
  return (
    <div className="user_card">
      <img alt={username} className="user_card__image" src={imagePath} />
      <span className="user_card__username">{username}</span>
    </div>
  );
};

export default Usercard;
