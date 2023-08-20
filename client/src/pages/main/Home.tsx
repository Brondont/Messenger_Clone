import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import SideBar from "../../components/Sidebar/SideBar";
import MainChat from "../../components/Mainchat/MainChat";

type User = {
  id: string;
  username: string;
  email: string;
  imagePath: string;
  gender: string;
};

const Home: React.FC<{ userId: string; token: string }> = ({
  userId,
  token,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  const rooturl = process.env.REACT_APP_ROOT_URL;
  useEffect(() => {
    console.log("home page mounted");
    fetch(rooturl + "/userContacts/" + userId, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
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

  return (
    <>
      <SideBar Users={users} />
      <MainChat Users={users} />
    </>
  );
};

export default Home;
