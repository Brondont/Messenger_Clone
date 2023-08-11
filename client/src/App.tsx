import React from "react";
import "./App.css";

import Sidebar from "./components/Sidebar/Sidebar";
import Mainchat from "./components/Mainchat/Mainchat";

const App: React.FC = () => {
  const activeUserChat = { username: "Brogan", imagePath: "Somepath" };
  return (
    <div className="main">
      <Sidebar
        Users={[{ username: "Brogan", id: "123", imagePath: "somePath" }]}
      />
      <Mainchat {...activeUserChat} />
    </div>
  );
};

export default App;
