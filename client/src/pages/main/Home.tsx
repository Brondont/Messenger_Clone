import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Socket } from "socket.io-client";

import SideBar from "../../components/Sidebar/SideBar";
import MainChat from "../../components/Mainchat/MainChat";

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
  useEffect(() => {
    if (!Users || !socket) {
      return;
    }
    socket.on("friendAccept", (user: User) => {
      handleUsers(user, "ADD");
    });

    socket.on("friendRemove", (users: User[]) => {
      users.map((user: User) => {
        handleUsers(user, "REMOVE");
      });
    });

    return () => {
      socket.off("friendAccept");
    };
  }, [socket, Users]);
  return (
    <>
      <SideBar Users={Users} />
      <MainChat Users={Users} />
    </>
  );
};

export default Home;
