import { createContext, useContext, useEffect, useState } from "react";
import {
  getPreferencias,
  salvarPreferencias
} from "../services/preferencias.service";

import { useLoja } from "../contexts/LojaContext" 

const PreferenciasContext = createContext();

export function PreferenciasProvider({ children }) {
  const { idLoja } = useLoja();
  console.log(idLoja)

  const [loading, setLoading] = useState(true);
  const [preferencias, setPreferencias] = useState({
    aceitarAutomatico: false,
    imprimirAutomatico: false,
    horarioFuncionamento: {}
  });


  useEffect(() => {
    async function carregar() {
      const data = await getPreferencias(idLoja);
      if (data) setPreferencias(data);
      setLoading(false);
    }

    carregar();
  }, [idLoja]);


  const atualizarPreferencias = async (novas) => {
    const atualizadas = { ...preferencias, ...novas };
    setPreferencias(atualizadas);
    await salvarPreferencias(idLoja, atualizadas);
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
