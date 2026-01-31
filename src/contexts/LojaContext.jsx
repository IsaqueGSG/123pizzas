import { createContext, useContext } from "react";
import { useParams, Navigate } from "react-router-dom";
import lojas from "../services/IdLojas.services";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const { idLoja } = useParams();

  const lojaExiste = lojas.some(
    (loja) => loja.idLoja === idLoja
  );

  if (!idLoja || !lojaExiste) {
    return <Navigate to="/" replace />;
  }

  return (
    <LojaContext.Provider value={{ idLoja }}>
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);
