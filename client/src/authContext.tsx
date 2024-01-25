import { createContext } from "react";
import { Socket } from "socket.io-client";

import { User } from "./userTypes";

export type AuthContextType = {
  clientUser: User | undefined;
  logoutHandler: () => void;
  socket: Socket | undefined;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
