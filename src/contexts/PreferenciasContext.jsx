import { createContext, useContext, useEffect, useState } from "react";
import {
  getPreferencias,
  salvarPreferencias
} from "../services/preferencias.service";

const PreferenciasContext = createContext();

export function PreferenciasProvider({ children }) {
  const [preferencias, setPreferencias] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const data = await getPreferencias();
      setPreferencias(
        data || {
          aceitarAutomatico: false,
          imprimirAutomatico: false,
          horarioFuncionamento: {}
        }
      );
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
