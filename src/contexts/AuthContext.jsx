import { createContext, useContext, useEffect, useState } from "react";
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

  // 🔥 revalida sempre que loja mudar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !idLoja) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const result = await getUserRole(idLoja, firebaseUser.email);

      if (!result.allowed) {
        await logout();
        setUser(null);
        setRole(null);
      } else {
        setUser(firebaseUser);
        setRole(result.role);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [idLoja]);

  const login = async () => {
    const firebaseUser = await loginWithGoogle();

    const result = await getUserRole(idLoja, firebaseUser.email);

    if (!result.allowed || result.role !== "admin") {
      await logout();
      alert("Acesso não autorizado para esta loja");
      return;
    }
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setRole(null);
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
