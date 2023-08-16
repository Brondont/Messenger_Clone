import React from "react";
import "./Usercard.css";

type User = {
  username: string;
  imagePath: string;
  userId: string;
};

interface UsercardProps extends User {
  onClick: () => void;
}

const Usercard: React.FC<UsercardProps> = ({
  username,
  imagePath,
  onClick,
}) => {
  return (
    <div className="user_card" onClick={onClick}>
      <img alt={username} className="user_card__image" src={imagePath} />
      <span className="user_card__username">{username}</span>
    </div>
  );
};

export default Usercard;
