import React, { useState } from "react";
import "./UserSearch.css";

import UserCard from "../Usercard/Usercard";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

const UserSearch: React.FC = () => {
  const [usersSearched, setUsersSearched] = useState<User[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const rooturl = process.env.REACT_APP_ROOT_URL;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const closeSearch = () => {
    setIsSubmitted(false);
    setUsersSearched([]);
  };

  const handleUserSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search");
    fetch(rooturl + "/usersSearch/" + searchQuery, {
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
        setUsersSearched(
          resData.users.filter((user: User) => {
            return user.id.toString() !== userId;
          })
        );
        setIsSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="usersearch">
      <form onSubmit={handleUserSearch}>
        <input
          className="usersearch-input"
          name="search"
          type="text"
          placeholder="Search for friends"
        ></input>
        {isSubmitted && (
          <div className="close_button" onClick={closeSearch}>
            X
          </div>
        )}
      </form>
      {isSubmitted && (
        <div className="usersearch-result">
          {usersSearched.length > 0 ? (
            <>
              {usersSearched.map((user) => {
                return (
                  <UserCard
                    user={user}
                    options={{ isAddFriend: true }}
                    key={user.id}
                  />
                );
              })}
            </>
          ) : (
            <span>No users found with that name.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
