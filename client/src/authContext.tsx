import { createContext } from "react";
import { Socket } from "socket.io-client";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

export type AuthContextType = {
  clientUser: User | undefined;
  logoutHandler: () => void;
  socket: Socket | undefined;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
