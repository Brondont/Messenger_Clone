import React from "react";
import "./Mainchat.css";

type User = {
  username: string;
  imagePath: string;
};

const Mainchat: React.FC<User> = (props) => {
  return (
    <div className="main_chat">
      <div className="main_chat__user">
        <img
          alt={props.username}
          className="main_chat__user_name"
          src={props.imagePath}
        />
        <span className="main_chat__user_name">{props.username}</span>
      </div>
      <div className="main_chat__user_messages">
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
            dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          </div>
        </div>
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
            dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          </div>
        </div>
        <div className="main_chat__user_message_sender_container">
          <div className="main_chat__user_message_sender">
            message 2 from user 2
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
        <div className="main_chat__user_message_receiver_container">
          <div className="main_chat__user_message_receiver">
            message 1 from user 1
          </div>
        </div>
      </div>
      <div className="main_chat__user_input">
        <input
          className="user_input"
          name="user_input"
          type="text"
          placeholder="Aa"
        />
      </div>
    </div>
  );
};

export default Mainchat;
