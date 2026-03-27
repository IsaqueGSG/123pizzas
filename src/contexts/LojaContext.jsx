import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLoja } from "../services/lojas.service";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const location = useLocation();

  const [loja, setLoja] = useState(null);
  const [idLoja, setIdLojaState] = useState(null);
  const [ready, setReady] = useState(false);

  const setIdLoja = async (lojaId) => {
    if (lojaId) {
      localStorage.setItem("idLoja", lojaId);
      setIdLojaState(lojaId);

      const data = await getLoja(lojaId);
      setLoja(data || null);

    } else {
      localStorage.removeItem("idLoja");
      setIdLojaState(null);
      setLoja(null);
    }
  };

  // ⭐ resolver loja por prioridade
  useEffect(() => {
    async function resolverLoja() {
      const pathSegments = location.pathname.split("/");
      const firstSegment = pathSegments[1];

      const rotasGlobais = ["", "login"];

      // 🔒 Rotas globais → usar localStorage
      if (rotasGlobais.includes(firstSegment)) {
        const saved = localStorage.getItem("idLoja");

        if (saved) {
          const data = await getLoja(saved);

          if (data) {
            setLoja(data);
            setIdLojaState(data.idLoja);
          } else {
            localStorage.removeItem("idLoja");
          }
        }

        setReady(true);
        return;
      }

      // 🌐 URL define loja (modo web)
      const data = await getLoja(firstSegment);

      if (!data) {
        setReady(true);
        return;
      }

      setLoja(data);
      setIdLojaState(data.idLoja);
      localStorage.setItem("idLoja", data.idLoja);

      setReady(true);
    }

    resolverLoja();
  }, [location.pathname]);

  if (!ready) return null;

  return (
    <LojaContext.Provider
      value={{
        loja,
        idLoja,
        setIdLoja,
        ready
      }}
    >
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);