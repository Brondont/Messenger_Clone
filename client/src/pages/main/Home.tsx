import React, { useEffect, useState } from "react";

import SideBar from "../../components/Sidebar/SideBar";
import MainChat from "../../components/Mainchat/MainChat";

type User = {
  id: string;
  username: string;
  imagePath: string;
  userId: string;
};

const Home: React.FC<{ userId: string; token: string }> = ({
  userId,
  token,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserWindow, setActiveUserWindow] = useState<string>("");

  const rooturl = process.env.REACT_APP_ROOT_URL;
  useEffect(() => {
    fetch(rooturl + "/userContacts/" + userId, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        console.log("fetch request for users sent and received");
        return setUsers(
          resData.users.map((user: User) => {
            return { ...user, imagePath: rooturl + user.imagePath };
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handleActiveUser = (userId: string) => {
    setActiveUserWindow(userId);
  };
  return (
    <>
      <SideBar Users={users} handleActiveUser={handleActiveUser} />
      <MainChat ActiveUserWindow={activeUserWindow} />
    </>
  );
};

export default Home;
