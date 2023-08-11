import React from "react";

type User = {
  id: string;
  username: string;
  imagePath: string;
};

const Usercard: React.FC<User> = (props) => {
  return (
    <div className="user_card" key={props.id}>
      <span className="user_card__username">{props.username}</span>
      <img
        alt={props.username}
        className="user_card__image"
        src={props.imagePath}
      />
    </div>
  );
};

export default Usercard;
