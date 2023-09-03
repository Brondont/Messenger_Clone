import React from "react";
import "./Usercard.css";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentOn: string;
};

type UserCardProps = {
  lastMessage?: UserMessage | undefined;
  user: User | undefined;
  options?: {
    isAddFriend: boolean;
  };
  onClick?: () => void;
};

const Usercard: React.FC<UserCardProps> = ({
  user,
  options,
  onClick,
  lastMessage,
}) => {
  const token = localStorage.getItem("token");
  const rooturl = process.env.REACT_APP_ROOT_URL;

  const handleAddFriend = () => {
    fetch(rooturl + "/addFriend/" + user!.id, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          console.log(resData.error);
        }
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="user_card" onClick={onClick}>
      {user ? (
        <>
          <img
            alt={user.username}
            className="user_card__image"
            src={rooturl + user.imagePath}
          />
          <div className="user_card__main">
            <span className="user_card__username">{user.username}</span>
            {lastMessage && (
              <div className="last-message"> {lastMessage.message} </div>
            )}
          </div>
          {options && options.isAddFriend && (
            <div className="add-friend">
              <button onClick={handleAddFriend}>Add Friend</button>
            </div>
          )}
        </>
      ) : (
        <div> Loading user info... </div>
      )}
    </div>
  );
};

export default Usercard;
