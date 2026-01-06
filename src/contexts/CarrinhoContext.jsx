import { createContext, useContext, useState, ReactNode } from "react";

const CarrinhoContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [itens, setItens] = useState([]);

  const addItem = (item) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.id === item.id);
      if (existe) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  };

  const removeItem = (id) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItens([]);

  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  const incrementar = (id) => {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  };

  const decrementar = (id) => {
    setItens((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };



  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        addItem,
        removeItem,
        incrementar,
        decrementar,
        total,
        quantidadeTotal
      }}
    >

      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCart deve estar dentro do CartProvider");
  return ctx;
};
