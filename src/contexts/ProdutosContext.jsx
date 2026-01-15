import { createContext, useContext, useEffect, useState } from "react";
import { getProdutos } from "../services/produtos.service";

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProdutos().then((res) => {
      setProdutos(res);
      setLoading(false);
    });
  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, loading }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export const useProducts = () => useContext(ProdutosContext);
