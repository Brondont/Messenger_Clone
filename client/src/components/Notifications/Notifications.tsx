import React, { useState, useEffect, useContext } from "react";
import "./Notifications.css";
import NotifImage from "../../public/images/notification.png";

import calculateTimeAgo from "../../util/timeAgo";
import { AuthContext, AuthContextType } from "../../authContext";

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
  const [notificationsCount, setNotificationsCount] = useState<number>(0);

  const rooturl = process.env.REACT_APP_ROOT_URL as string;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const { socket } = useContext(AuthContext) as AuthContextType;

  const handleFriendResponse = (
    e: React.MouseEvent<HTMLDivElement>,
    notification: Notification
  ) => {
    setNotifications((prevNotifs: Notification[]) => {
      return prevNotifs.map((prevNotif: Notification) => {
        if (prevNotif.id === notification.id) {
          prevNotif.seen = true;
        }
        return prevNotif;
      });
    });

    const reply = (e.target as HTMLDivElement).innerHTML;

    fetch(rooturl + "/addFriend/" + notification.notifierId, {
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
      .catch((err) => {
        console.log(err);
      });
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
        setNotificationsCount(() => {
          let count = 0;
          resData.notifications.map((notif: Notification) => {
            if (!notif.seen) {
              count++;
            }
          });
          return count;
        });
      });
    if (!socket) {
      return;
    }

    socket.on("newFriendRequestNotif", (notification: Notification) => {
      setNotifications((prevState) => {
        return [...prevState, notification];
      });
      setNotificationsCount((prevState) => {
        return prevState + 1;
      });
    });

    socket.on("friendshipReply", (notification: Notification) => {
      setNotifications((prevState) => {
        return [...prevState, notification];
      });
      setNotificationsCount((prevState) => {
        return prevState + 1;
      });
    });

    return () => {
      socket.off("newFriendRequestNotif");
      socket.off("friendshipReply");
    };
  }, [isOpen, rooturl, userId, token, socket]);

  const handleToggleNotifcations = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="notifications-icon" onClick={handleToggleNotifcations}>
        <img className="notifications-image" src={NotifImage} />
        {notificationsCount > 0 && (
          <span className="notifications-count"> {notificationsCount} </span>
        )}
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
                                return handleFriendResponse(e, notification);
                              }}
                            >
                              Accept
                            </div>
                            <div
                              className="notifications-button decline"
                              onClick={(e) => {
                                return handleFriendResponse(e, notification);
                              }}
                            >
                              Decline
                            </div>
                          </>
                        )}
                        <span>{calculateTimeAgo(notification.createdAt)}</span>
                      </div>
                    );
                  } else if (notification.type === "FriendshipReply") {
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
