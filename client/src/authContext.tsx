import { createContext } from "react";

export type AuthContextType = {
  logoutHandler: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
