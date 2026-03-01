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
    const firstSegment = pathSegments[1]; // ex: "", "demo", "chavao", "login"

    const saved = localStorage.getItem("idLoja");

    // 🔥 1. Se a URL contém uma loja válida → PRIORIDADE TOTAL (WEB)
    const lojaDaUrl = lojas.find(l => l.idLoja === firstSegment);

    if (lojaDaUrl) {
      setIdLojaState(lojaDaUrl.idLoja);
      localStorage.setItem("idLoja", lojaDaUrl.idLoja);
      setReady(true);
      return;
    }

    // 🔒 2. Rotas que NÃO devem herdar localStorage
    const rotasPublicasGlobais = ["", "login"];
    // "" = "/"

    if (rotasPublicasGlobais.includes(firstSegment)) {
      setIdLojaState(null);
      setReady(true);
      return;
    }

    // 🖥️ 3. Fallback para Electron (quando não há loja na URL)
    if (saved) {
      const lojaExiste = lojas.some(l => l.idLoja === saved);
      setIdLojaState(lojaExiste ? saved : null);
    } else {
      setIdLojaState(null);
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