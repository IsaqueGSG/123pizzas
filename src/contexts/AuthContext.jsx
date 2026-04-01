import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginWithGoogle,
  logout,
  getUserRole,
} from "../services/auth.service";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

import { useLoja } from "../contexts/LojaContext";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { idLoja } = useLoja();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAdminDrawer, setOpenAdminDrawer] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && idLoja) {
        const result = await getUserRole(idLoja, firebaseUser.email);
        setRole(result.role); // Seta admin, viewer ou null
      } else {
        setRole(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [idLoja]);

  const login = async () => {
    try {
      await loginWithGoogle();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const signOut = async () => {
    await logout();

    setUser(null);
    setRole(null);

    localStorage.removeItem("idLoja");

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        signOut,
        loading,
        openAdminDrawer,
        setOpenAdminDrawer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
