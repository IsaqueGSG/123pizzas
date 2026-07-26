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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function carregarRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      if (!idLoja) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await getUserRole(idLoja, user.email);
        setRole(result.role);
      } catch (e) {
        console.error(e);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    carregarRole();
  }, [user, idLoja]);

  const login = async () => {
    try {
      const user = await loginWithGoogle();

      const isRegistro = sessionStorage.getItem("modoRegistro");

      if (!isRegistro) {
        const result = await getUserRole(idLoja, user.email);

        if (!result.allowed) {
          await logout();
          return alert(
            "Sua conta (" + user.email + ") não tem permissão para acessar esta loja."
          );
        }
      }

      return { success: true };

    } catch (e) {
      console.error(e);
      return { error: "erro-login" };
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
