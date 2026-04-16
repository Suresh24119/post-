import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved intelligence profile
    const savedUser = localStorage.getItem("intelligence_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password) => {
    const res = await registerUser(email, password);
    const userData = res.data.user;
    setUser(userData);
    localStorage.setItem("intelligence_user", JSON.stringify(userData));
    return res;
  };

  const signIn = async (email, password) => {
    const res = await loginUser(email, password);
    const userData = res.data.user;
    setUser(userData);
    localStorage.setItem("intelligence_user", JSON.stringify(userData));
    return res;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("intelligence_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
