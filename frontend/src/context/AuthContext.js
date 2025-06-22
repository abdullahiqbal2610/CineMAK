import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const getToken = () => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? storedToken : null;
  };

  const [auth, setAuth] = useState({
    token: getToken(),
    usertype: localStorage.getItem("usertype") || null, 
  });


  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("token", auth.token);
      localStorage.setItem("usertype", auth.usertype);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("usertype");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
