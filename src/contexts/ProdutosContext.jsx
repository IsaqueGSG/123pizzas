import { createContext, useContext, useEffect, useState } from "react";
import { getProdutos } from "../services/produtos.service";

import { useLoja } from "../contexts/LojaContext" 

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const { idLoja } = useLoja();
  console.log(idLoja)

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProdutos(idLoja).then((res) => {
      setProdutos(res);
      setLoading(false);
    });
  }, [idLoja]);

  return (
    <ProdutosContext.Provider value={{ produtos, loading }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export const useProducts = () => useContext(ProdutosContext);
