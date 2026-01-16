import { createContext, useContext, useEffect, useState } from "react";
import {
  getPreferencias,
  salvarPreferencias
} from "../services/preferencias.service";

const PreferenciasContext = createContext();

export function PreferenciasProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [preferencias, setPreferencias] = useState({
    aceitarAutomatico: false,
    imprimirAutomatico: false,
    horarioFuncionamento: {}
  });


  useEffect(() => {
    async function carregar() {
      const data = await getPreferencias();
      if (data) setPreferencias(data);
      setLoading(false);
    }

    carregar();
  }, []);


  const atualizarPreferencias = async (novas) => {
    const atualizadas = { ...preferencias, ...novas };
    setPreferencias(atualizadas);
    await salvarPreferencias(atualizadas);
  };

  return (
    <PreferenciasContext.Provider
      value={{
        preferencias,
        atualizarPreferencias,
        loading
      }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}
