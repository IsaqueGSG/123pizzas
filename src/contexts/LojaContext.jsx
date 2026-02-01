import { createContext, useContext, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import lojas from "../services/IdLojas.services";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const params = useParams();

  const [idLoja, setIdLoja] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let lojaId = params.idLoja;

    if (!lojaId) {
      lojaId = localStorage.getItem("idLoja");
    }

    const lojaExiste = lojas.some(l => l.idLoja === lojaId);

    if (lojaExiste) {
      setIdLoja(lojaId);
      localStorage.setItem("idLoja", lojaId);
    } else {
      localStorage.removeItem("idLoja");
    }


    setReady(true);
  }, [params.idLoja]);

  if (!ready) return null;

  if (!idLoja) {
    return <Navigate to="/selecionarloja" replace />;
  }

  return (
    <LojaContext.Provider value={{ idLoja, setIdLoja }}>
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);
