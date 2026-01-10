import { createContext, useContext, useEffect, useState } from "react";
import { getPizzas } from "../services/pizzas.service"
import { getBebidas } from "../services/bebidas.service"

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const listaPizzas = await getPizzas();
    const listaBebidas = await getBebidas();

    setProdutos([...listaBebidas, ...listaPizzas]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, loading, load }} >
      {children}
    </ProdutosContext.Provider>
  );
}


export const useProducts = () => {
  const context = useContext(ProdutosContext);
  if (!context) {
    throw new Error(
      "useProducts deve ser usado dentro do ProdutosProvider"
    );
  }
  return context;
};
