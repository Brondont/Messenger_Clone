import React from "react";

import SideBar from "../../components/Sidebar/SideBar";
import MainChat from "../../components/Mainchat/MainChat";

type activeUser = {
  username: string;
  imagePath: string;
};

const Home: React.FC<activeUser> = (activeUserChat) => {
  return (
    <>
      <SideBar
        Users={[{ username: "Brogan", id: "123", imagePath: "somePath" }]}
      />
      <MainChat {...activeUserChat} />
    </>
  );
};

export default Home;
