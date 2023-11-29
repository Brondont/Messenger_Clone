import React from "react";
import "./Usercard.css";

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
    isFriendProfile?: boolean;
    onHover?: boolean;
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
  const userId = localStorage.getItem("userId");
  const rooturl = process.env.REACT_APP_ROOT_URL;

  const handleAddFriend = () => {
    if (!user) {
      return;
    }
    fetch(rooturl + "/addFriend/" + user.id, {
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

  const handleRemoveFriend = (e: React.MouseEvent<HTMLElement>) => {
    if (!user) {
      return;
    }
    const type = e.currentTarget.innerHTML;
    fetch(rooturl + "/removeFriend", {
      method: "PUT",
      body: JSON.stringify({
        friendId: user.id,
        type: type,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
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
            src={rooturl + user.imagePath}
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
            (options.isAddFriend && (
              <div className="add-friend">
                <button onClick={handleAddFriend}>Add Friend</button>
              </div>
            )) ||
            (options.isFriendProfile && userId !== user.id.toString() && (
              <div className="friend-profile">
                <div className="unfriend" onClick={handleRemoveFriend}>
                  Unfriend
                </div>
                <div className="block" onClick={handleRemoveFriend}>
                  Block
                </div>
              </div>
            ))
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

export default Usercard;
