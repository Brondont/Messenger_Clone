type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

type UserMessage = {
  id: number;
  createdAt: number;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};

function getMostRecentMessage(user: User) {
  // const receivedMessages = user.ReceivedMessages || [];
  // const sentMessages = user.SentMessages || [];
  // const allMessages = receivedMessages.concat(sentMessages);
  // if (allMessages.length === 0) {
  //   return undefined;
  // }
  // const mostRecentMessage = allMessages.reduce(
  //   (acc: UserMessage, message: UserMessage) => {
  //     const messageTimestamp = new Date(message.createdAt).getTime();
  //     if (!acc || messageTimestamp > new Date(acc.createdAt).getTime()) {
  //       return message;
  //     }
  //     return acc;
  //   }
  // );
  // return mostRecentMessage;
}

export default getMostRecentMessage;
