import React from "react";
import "./UserCard.css";

import calculateTimeAgo from "../../util/timeAgo";

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
  status: string;
};

type UserCardProps = {
  lastMessage?: UserMessage | undefined;
  user: User | undefined;
  options?: {
    isAddFriend?: boolean;
    onHover?: boolean;
  };
  onClick?: () => void;
};

const UserCard: React.FC<UserCardProps> = ({
  user,
  options,
  onClick,
  lastMessage,
}) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const rootUrl = process.env.REACT_APP_ROOT_URL;

  const handleAddFriend = () => {
    if (!user) {
      return;
    }
    fetch(rootUrl + "/addFriend/" + user.id, {
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
    <div
      className={
        options
          ? options.onHover
            ? "user_card"
            : "user_card_noHover"
          : "user_card"
      }
      onClick={onClick}
    >
      {user ? (
        <>
          <img
            alt={user.username}
            className="user_card__image"
            src={rootUrl + user.imagePath}
          />
          <div className="user_card__main">
            <span className="user_card__username">{user.username}</span>
            {lastMessage && (
              <>
                <div
                  className={
                    lastMessage.status === "seen"
                      ? "last-message"
                      : "last-message active_message"
                  }
                >
                  {(lastMessage.senderId.toString() === userId
                    ? "You: "
                    : user.username + ": ") + lastMessage.message}
                </div>
                <>{calculateTimeAgo(lastMessage.createdAt.toString())}</>
              </>
            )}
          </div>
          {options ? (
            options.isAddFriend && (
              <div className="add-friend">
                <button onClick={handleAddFriend}>Add Friend</button>
              </div>
            )
          ) : (
            <></>
          )}
        </>
      ) : (
        <div> Loading user info... </div>
      )}
    </div>
  );
};

export default UserCard;
