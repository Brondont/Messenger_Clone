import React, { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

import MainChat from "../../components/mainChat/MainChat";
import SideBar from "../../components/sideBar/SideBar";
import MiniProfile from "../../components/miniProfile/MiniProfile";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: Date;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

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
  const [newestMessages, setNewestMessages] = useState<UserMessage[]>([]);

  const rootUrl = process.env.REACT_APP_ROOT_URL as string;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!Users || !socket) {
      return;
    }

    fetch(rootUrl + "/newestMessages", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        setNewestMessages(resData.newestMessages);
      });

    socket.on("newMessage", (newMessage: UserMessage) => {
      setNewestMessages((prevMessages: UserMessage[]) => {
        return prevMessages.map((message: UserMessage) => {
          if (
            message &&
            ((message.senderId.toString() === newMessage.senderId.toString() &&
              message.receiverId.toString() ===
                newMessage.receiverId.toString()) ||
              (message.senderId.toString() ===
                newMessage.receiverId.toString() &&
                message.receiverId.toString() ===
                  newMessage.senderId.toString()))
          ) {
            return {
              ...newMessage,
            };
          }
          return message;
        });
      });
    });

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
  }, [socket, updateUsers, Users, rootUrl, token, handleUsers]);
  return (
    <>
      <SideBar Users={Users} newestMessage={newestMessages} />
      <MainChat
        Users={Users}
        setProfileIsOpen={setProfileIsOpen}
        setNewestMessages={setNewestMessages}
      />
      {profileIsOpen && <MiniProfile Users={Users} />}
    </>
  );
};

export default Home;
