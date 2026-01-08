import { createContext, useContext, useEffect, useState } from "react";
import { getPizzas } from "../services/pizzas.service"
import { getBebidas } from "../services/bebidas.service"

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const listaPizzas = await getPizzas();
        const listaBebidas = await getBebidas();

        const produtos = [
          ...listaBebidas,
          ...listaPizzas
        ]

        console.log(produtos)
        setProdutos(produtos);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    load();

  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, loading }}>
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
