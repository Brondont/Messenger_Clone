import React, { useState, useEffect } from "react";
import "./Notifications.css";
import NotifImage from "../../public/images/notification.png";

import calculateTimeAgo from "../../util/timeAgo";

type Notification = {
  id: number;
  type: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
  notifiedId: number;
  notifierId: number;
  seen: boolean;
};

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const rooturl = process.env.REACT_APP_ROOT_URL;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const handleFriendResponse = (
    e: React.MouseEvent<HTMLDivElement>,
    notifierId: string
  ) => {
    const reply = (e.target as HTMLDivElement).innerHTML;
    fetch(rooturl + "/addFriend/" + notifierId, {
      method: "PUT",
      body: JSON.stringify({ reply }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          console.log(resData);
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    fetch(rooturl + "/notifications/" + userId, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          return;
        }
        setNotifications(resData.notifications);
      });
  }, [isOpen, rooturl, userId, token]);

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
                {notifications.map((notification: Notification) => {
                  if (notification.type === "Friendship") {
                    return (
                      <div
                        key={notification.id}
                        className={
                          notification.seen
                            ? "notifications-item seen"
                            : "notifications-item"
                        }
                      >
                        <p>{notification.desc}</p>
                        {notification.seen && <p> seen </p>}
                        {!notification.seen && (
                          <>
                            <div
                              className="notifications-button accept"
                              onClick={(e) => {
                                notification.seen = true;
                                return handleFriendResponse(
                                  e,
                                  notification.notifierId.toString()
                                );
                              }}
                            >
                              Accept
                            </div>
                            <div
                              className="notifications-button decline"
                              onClick={(e) => {
                                notification.seen = true;
                                return handleFriendResponse(
                                  e,
                                  notification.notifierId.toString()
                                );
                              }}
                            >
                              Decline
                            </div>
                          </>
                        )}
                        <span>{calculateTimeAgo(notification.createdAt)}</span>
                      </div>
                    );
                  }
                })}
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
