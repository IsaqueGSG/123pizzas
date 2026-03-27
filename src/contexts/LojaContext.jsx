import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLojas } from "../services/lojas.service";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const location = useLocation();

  const [lojas, setLojas] = useState([]);
  const [idLoja, setIdLojaState] = useState(null);
  const [ready, setReady] = useState(false);

  // 🔥 1. Carregar lojas do Firestore
  useEffect(() => {
    async function carregar() {
      const data = await getLojas();
      setLojas(data);
    }
    carregar();
  }, []); // roda apenas uma vez

  const setIdLoja = (lojaId) => {
    if (lojaId) {
      localStorage.setItem("idLoja", lojaId);
      setIdLojaState(lojaId);
    } else {
      localStorage.removeItem("idLoja");
      setIdLojaState(null);
    }
  };

  // 🔥 2. Resolver loja da URL após carregar lojas
  useEffect(() => {
    if (!lojas) return; // null enquanto carrega

    const pathSegments = location.pathname.split("/");
    const firstSegment = pathSegments[1];

    const saved = localStorage.getItem("idLoja");

    // ⭐ 1. Prioridade → URL
    const lojaDaUrl = lojas.find(l => l.idLoja === firstSegment);

    if (lojaDaUrl) {
      setIdLojaState(lojaDaUrl.idLoja);
      localStorage.setItem("idLoja", lojaDaUrl.idLoja);
      setReady(true);
      return;
    }

    // 🔒 Rotas globais
    const rotasPublicasGlobais = ["", "login"];

    if (rotasPublicasGlobais.includes(firstSegment)) {
      setIdLojaState(null);
      setReady(true);
      return;
    }

    // 🖥️ Fallback Electron
    if (saved) {
      const lojaExiste = lojas.some(l => l.idLoja === saved);
      setIdLojaState(lojaExiste ? saved : null);
    } else {
      setIdLojaState(null);
    }

    setReady(true);

  }, [location.pathname, lojas]); // 👈 agora depende das lojas

  if (!ready) return null;

  return (
    <LojaContext.Provider value={{ lojas, idLoja, setIdLoja, ready }}>
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);