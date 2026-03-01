import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import lojas from "../services/IdLojas.services";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const location = useLocation();

  const [idLoja, setIdLojaState] = useState(null);
  const [ready, setReady] = useState(false);

  const setIdLoja = (lojaId) => {
    if (lojaId) {
      localStorage.setItem("idLoja", lojaId);
      setIdLojaState(lojaId);
    } else {
      localStorage.removeItem("idLoja");
      setIdLojaState(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("idLoja");

    if (!saved) {
      setIdLojaState(null);
      setReady(true);
      return;
    }

    const lojaExiste = lojas.some(l => l.idLoja === saved);

    if (lojaExiste) {
      setIdLojaState(saved);
    } else {
      localStorage.removeItem("idLoja");
      setIdLojaState(null);
    }

    setReady(true);
  }, []);

  if (!ready) return null;

  const isPublicRoute =
    location.pathname === "/login";

  // 🔒 Proteção global
  if (!idLoja && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LojaContext.Provider value={{ idLoja, setIdLoja }}>
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);