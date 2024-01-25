import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import MainChat from "../../components/mainChat/MainChat";
import SideBar from "../../components/sideBar/SideBar";
import MiniProfile from "../../components/miniProfile/MiniProfile";

import { User, UserMessage } from "../../userTypes";

type HomePageProps = {
  socket: Socket | undefined;
  Users: User[];
  handleUsers: (user: User, action: string) => void;
  updateUsers: (users: User[]) => void;
};

const Home: React.FC<HomePageProps> = ({
  Users,
  socket,
  handleUsers,
  updateUsers,
}) => {
  const [profileIsOpen, setProfileIsOpen] = useState<boolean>(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!Users || !socket || !userId || !token) {
      return;
    }

    socket.on("newMessage", (newMessage: UserMessage) => {
      console.log(newMessage);
      const newUsers = Users.map((user) => {
        if (
          (user.id.toString() === newMessage.senderId.toString() &&
            userId === newMessage.receiverId.toString()) ||
          (userId === newMessage.senderId.toString() &&
            user.id.toString() === newMessage.receiverId.toString())
        ) {
          user.message = newMessage;
        }
        return user;
      });
      updateUsers(newUsers);
    });

    socket.on("receiverSawMessages", ({ receiverId, senderId }) => {});

    socket.on("friendAccept", (user: User) => {
      handleUsers(user, "ADD");
    });

    socket.on("friendRemove", (users: User[]) => {
      users.forEach((user: User) => {
        handleUsers(user, "REMOVE");
      });
    });

    return () => {
      socket.off("message");
      socket.off("seenMessage");
      socket.off("friendAccept");
      socket.off("friendRemove");
    };
  }, [socket, updateUsers, Users, token, handleUsers, userId]);
  return (
    <>
      <SideBar Users={Users} />
      <MainChat
        Users={Users}
        setProfileIsOpen={setProfileIsOpen}
        updateUsers={updateUsers}
      />
      {profileIsOpen && <MiniProfile Users={Users} />}
    </>
  );
};

export default Home;
