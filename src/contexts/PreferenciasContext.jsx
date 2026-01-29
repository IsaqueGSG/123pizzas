import { createContext, useContext, useEffect, useState } from "react";
import {
  getPreferencias,
  salvarPreferencias
} from "../services/preferencias.service";

import { useLoja } from "../contexts/LojaContext"

const PreferenciasContext = createContext();

const DEFAULT_PREFS = {
  enderecoLoja: {
    cep: "01001-000",
    numero: "0",
    rua: "Praça da Sé",
    bairro: "Sé",
    cidade: "São Paulo",
    uf: "SP",
    lat: -23.55052,
    lng: -46.633308
  },
  taxaEntregaKm: 0,
  horarios: {
    segunda: { ativo: true, inicio: "18:00", fim: "23:00" },
    terca: { ativo: true, inicio: "18:00", fim: "23:00" },
    quarta: { ativo: true, inicio: "18:00", fim: "23:00" },
    quinta: { ativo: true, inicio: "18:00", fim: "23:00" },
    sexta: { ativo: true, inicio: "18:00", fim: "23:59" },
    sabado: { ativo: true, inicio: "18:00", fim: "23:59" },
    domingo: { ativo: false, inicio: "18:00", fim: "23:00" }
  }
};

export function PreferenciasProvider({ children }) {
  const { idLoja } = useLoja();

  const [loading, setLoading] = useState(true);
  const [preferencias, setPreferencias] = useState(DEFAULT_PREFS);

  useEffect(() => {
    async function carregar() {
      const data = await getPreferencias(idLoja);

      if (data) setPreferencias({ ...DEFAULT_PREFS, ...data });

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
