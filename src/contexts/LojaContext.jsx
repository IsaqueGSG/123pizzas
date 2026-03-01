import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
    const pathSegments = location.pathname.split("/");
    const idFromUrl = pathSegments[1];
    const saved = localStorage.getItem("idLoja");

    // PRIORIDADE 1: URL (web)
    if (idFromUrl && idFromUrl !== "login") {
      const existe = lojas.some(l => l.idLoja === idFromUrl);

      if (existe) {
        setIdLojaState(idFromUrl);
        localStorage.setItem("idLoja", idFromUrl);
        setReady(true);
        return;
      }
    }

    // PRIORIDADE 2: localStorage (electron)
    if (saved) {
      const existe = lojas.some(l => l.idLoja === saved);
      setIdLojaState(existe ? saved : null);
    }

    setReady(true);
  }, [location.pathname]);

  if (!ready) return null;

  return (
    <LojaContext.Provider value={{ idLoja, setIdLoja }}>
      {children}
    </LojaContext.Provider>
  );
}
export const useLoja = () => useContext(LojaContext);