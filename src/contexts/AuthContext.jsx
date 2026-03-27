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
  const navigate = useNavigate();
  const { idLoja } = useLoja();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAdminDrawer, setOpenAdminDrawer] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // 🔥 usuário existe, mas não está em uma loja específica
      if (!idLoja) {
        setUser(firebaseUser);
        setRole(null);
        setLoading(false);

        // ⭐ se está criando loja → ir para confirmação
        const modoRegistro = sessionStorage.getItem("modoRegistro");
        if (modoRegistro) {
          navigate("/confirmar-criacao");
        }

        return;
      }

      setLoading(true);

      try {
        const result = await getUserRole(idLoja, firebaseUser.email);

        if (!result.allowed) {
          setLoading(false);
          navigate("/");
          return;
        }

        setUser(firebaseUser);
        setRole(result.role);

      } catch (err) {
        console.error(err);
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [idLoja, navigate]);

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
