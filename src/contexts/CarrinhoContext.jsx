import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [openCarrinho, setOpenCarrinho] = useState(false);

  const addItem = (item) => {
    console.log("Adicionando item ao carrinho:", item);
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

  const removeItem = (id) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const limparCarrinho = () => setItens([]);

  const total = itens.reduce(
    (acc, item) => acc + Number(item.valor || 0) * item.quantidade,
    0
  );

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        addItem,
        incrementar,
        decrementar,
        removeItem,
        limparCarrinho,
        total,
        quantidadeTotal,
        openCarrinho,
        setOpenCarrinho
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho deve estar dentro do CartProvider");
  return ctx;
};
