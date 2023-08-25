import React, { useState } from "react";
import "./Notifications.css";
import NotifImage from "../../public/images/notification.png";

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [notifications, setNotifications] = useState([]);

  const handleToggleNotifcations = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="notifications-icon" onClick={handleToggleNotifcations}>
        <img className="notifications-image" src={NotifImage} />
      </div>
      {isOpen && (
        <div className="notifications">
          <div className="notifications-container">
            {notifications.length > 0 ? (
              <>
                <div> you have a friend request </div>
              </>
            ) : (
              <div className="notificatins-item-missing">
                You've got no notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
