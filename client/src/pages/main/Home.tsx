import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import MainChat from "../../components/mainchat/MainChat";
import SideBar from "../../components/sidebar/SideBar";
import MiniProfile from "../../components/miniprofile/MiniProfile";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
  ReceivedMessages: UserMessage[];
  SentMessages: UserMessage[];
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

type HomePageProps = {
  socket: Socket | undefined;
  Users: User[];
  handleUsers: (user: User, action: string) => void;
};

const Home: React.FC<HomePageProps> = ({ Users, socket, handleUsers }) => {
  const [profileIsOpen, setProfileIsOpen] = useState<boolean>(false);
  useEffect(() => {
    if (!Users || !socket) {
      return;
    }
    socket.on("friendAccept", (user: User) => {
      handleUsers(user, "ADD");
    });

    socket.on("friendRemove", (users: User[]) => {
      users.forEach((user: User) => {
        handleUsers(user, "REMOVE");
      });
    });

    return () => {
      socket.off("friendAccept");
      socket.off("friendRemove");
    };
  }, [socket, Users, handleUsers]);
  return (
    <>
      <SideBar Users={Users} />
      <MainChat Users={Users} setProfileIsOpen={setProfileIsOpen} />
      {profileIsOpen && <MiniProfile Users={Users} />}
    </>
  );
};

export default Home;
