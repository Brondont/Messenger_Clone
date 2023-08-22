import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import SideBar from "../../components/Sidebar/SideBar";
import MainChat from "../../components/Mainchat/MainChat";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};
const Home: React.FC<{ Users: User[] }> = ({ Users }) => {
  return (
    <>
      <SideBar Users={Users} />
      <MainChat Users={Users} />
    </>
  );
};

export default Home;
