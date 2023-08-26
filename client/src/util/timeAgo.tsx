const calculateTimeAgo = (timestamp: string): string => {
  const currentTime = new Date();
  const notificationTime = new Date(timestamp);
  const timeDifference = currentTime.getTime() - notificationTime.getTime();

  if (timeDifference < 60000) {
    return "Just now";
  } else if (timeDifference < 3600000) {
    const minutes = Math.floor(timeDifference / 60000);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (timeDifference < 86400000) {
    const hours = Math.floor(timeDifference / 3600000);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(timeDifference / 86400000);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

export default calculateTimeAgo;
