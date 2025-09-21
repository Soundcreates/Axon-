import { server } from "@/service/backendApi";
import React, { useState, useEffect, useContext, createContext } from "react";

type User = {
  walletAddress: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  roles: string;

}
type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      const response = await server.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 200) {
        setUser(response.data.user)
        console.log("user: ", response.data.user);
      }
    } catch (err) {

      console.log("Error at authContext fetch user! : ", err.message);

    }

  }

  useEffect(() => {
    fetchUser();
  }, [])
  return (
    <AuthContext.Provider value={{ user, isLoading, setIsLoading }} >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext);
}