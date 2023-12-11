import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "./MiniProfile.css";

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
  ReceivedMessages: UserMessage[];
  SentMessages: UserMessage[];
};

const MiniProfile: React.FC<{
  Users: User[];
}> = ({ Users = [] }) => {
  const [activeUser, setActiveUser] = useState<User>();
  const activeUserWindow = useParams<{ receiverId: string }>().receiverId;

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const rootUrl = process.env.REACT_APP_ROOT_URL;

  useEffect(() => {
    setActiveUser(
      Users.find((user: User) => {
        return user.id.toString() === activeUserWindow;
      })
    );
  }, [activeUserWindow, Users]);

  const handleRemoveFriend = (e: React.MouseEvent<HTMLElement>) => {
    if (!activeUser) {
      return;
    }
    const type = e.currentTarget.innerHTML;
    fetch(rootUrl + "/removeFriend", {
      method: "PUT",
      body: JSON.stringify({
        friendId: activeUser.id,
        type: type,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
  };

  return activeUser && userId ? (
    <div className="mini_profile">
      <img
        className="mini_profile__image"
        src={rootUrl + activeUser.imagePath}
        alt="User Profile"
      />
      <h3 className="mini_profile__name">{activeUser.username}</h3>
      {+userId !== activeUser.id && (
        <div className="mini_profile__options">
          <div className="mini_profile__unfriend" onClick={handleRemoveFriend}>
            Unfriend
          </div>
          <div className="mini_profile__block" onClick={handleRemoveFriend}>
            Block
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default MiniProfile;
