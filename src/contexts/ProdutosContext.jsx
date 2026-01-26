import { createContext, use, useContext, useEffect, useState, useRef } from "react";
import { getProdutos } from "../services/produtos.service";
import { getCategorias } from "../services/categorias.service";
import { useLoja } from "../contexts/LojaContext";

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const { idLoja } = useLoja();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [produtosComCategoria, setProdutosComCategoria] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregou = useRef(false);

  useEffect(() => {
    if (!idLoja || carregou.current) return;

    carregou.current = true;

    const carregar = async () => {
      setLoading(true);

      const [prods, cats] = await Promise.all([
        getProdutos(idLoja),
        getCategorias(idLoja)
      ]);

      const produtosComCategoria = prods.map(produto => ({
        ...produto,
        categoria: cats.find(cat => cat.id === produto.categoriaId) || null
      }));

      setProdutos(prods);
      setCategorias(cats);
      setProdutosComCategoria(produtosComCategoria);

      console.log(cats);
      setLoading(false);
    };

    carregar();
  }, [idLoja]);

  return (
    <ProdutosContext.Provider
      value={{
        produtos: produtosComCategoria,
        categorias,
        loading,
      }}
    >
      {children}
    </ProdutosContext.Provider>
  );
}

export const useProducts = () => useContext(ProdutosContext);
