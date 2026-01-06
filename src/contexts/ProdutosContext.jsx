import { createContext, useContext, useEffect, useState } from "react";

const ProdutosContext = createContext(null);

const produtosTeste = [
  {
    id: 0,
    nome: "Pizza Calabresa",
    valor: 38,
    img: "https://images8.alphacoders.com/369/369063.jpg",
    tipo: "pizza"
  },
  {
    id: 1,
    nome: "Pizza Marguerita",
    valor: 36,
    img: "https://images8.alphacoders.com/369/369063.jpg",
    tipo: "pizza"
  },
  {
    id: 2,
    nome: "Refrigerante 1L",
    valor: 8,
    img: "https://images8.alphacoders.com/369/369063.jpg",
    tipo: "bebida"
  }
];

export const ProdutosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simula busca (API/Firebase no futuro)
    setProdutos(produtosTeste);
    setLoading(false);
  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, loading }}>
      {children}
    </ProdutosContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProdutosContext);
  if (!context) {
    throw new Error(
      "useProducts deve ser usado dentro do ProdutosProvider"
    );
  }
  return context;
};
