import { createContext, useContext } from "react";
import { useParams, Navigate } from "react-router-dom";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const { idLoja } = useParams();

  if (!idLoja) {
    return <Navigate to="/" replace />;
  }

  return (
    <LojaContext.Provider value={{ idLoja }}>
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);
