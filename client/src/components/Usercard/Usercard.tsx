import React from "react";
import "./Usercard.css";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

type UserCardProps = {
  user: User | undefined;
  options?: {
    isAddFriend: boolean;
  };
};

const Usercard: React.FC<UserCardProps> = ({ user, options }) => {
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
    <div className="user_card">
      {user ? (
        <>
          <img
            alt={user.username}
            className="user_card__image"
            src={rooturl + user.imagePath}
          />
          <span className="user_card__username">{user.username}</span>
          {options &&
            options.isAddFriend && (
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
