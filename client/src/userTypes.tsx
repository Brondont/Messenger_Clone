export type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
  message: UserMessage | undefined;
};

export type UserMessage = {
  id: number;
  createdAt: Date;
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
};
