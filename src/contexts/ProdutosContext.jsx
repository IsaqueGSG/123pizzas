import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getProdutos } from "../services/produtos.service";
import { getCategorias } from "../services/categorias.service";
import { useLoja } from "./LojaContext";

const ProdutosContext = createContext();

export function ProdutosProvider({ children }) {
  const { idLoja } = useLoja();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregou = useRef(false);
  useEffect(() => {
    carregou.current = false;
  }, [idLoja]);


  /* ---------- LOAD ÚNICO ---------- */
  useEffect(() => {
    if (!idLoja || carregou.current) return;

    carregou.current = true;

    const carregar = async () => {
      setLoading(true);

      const [prods, cats] = await Promise.all([
        getProdutos(idLoja),
        getCategorias(idLoja)
      ]);

      setProdutos(prods);
      setCategorias(cats);
      setLoading(false);
    };

    carregar();
  }, [idLoja]);

  /* ---------- PRODUTOS COM CATEGORIA (DERIVADO) ---------- */
  const produtosComCategoria = produtos.map(prod => ({
    ...prod,
    categoria: categorias.find(cat => cat.id === prod.categoriaId) || null
  }));

  /* ---------- FUNÇÕES PRODUTOS ---------- */

  const addProduto = (produto) => {
    setProdutos(prev => [...prev, produto]);
  };

  const updateProduto = (id, data) => {
    setProdutos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const removeProduto = (id) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const updateProdutosStatus = (produtosAlterados) => {
    setProdutos(prev =>
      prev.map(p => {
        const alterado = produtosAlterados.find(a => a.id === p.id);
        return alterado ? { ...p, status: alterado.status } : p;
      })
    );
  };

  /* ---------- FUNÇÕES CATEGORIAS  ---------- */

  const addCategoria = (categoria) => {
    setCategorias(prev => [...prev, categoria]);
  };

  const updateCategoria = (id, data) => {
    setCategorias(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...data } : cat))
    );
  };

  const removeCategoria = (id) => {
    setCategorias(prev => prev.filter(cat => cat.id !== id));
  };

  const updateCategoriasStatus = (categoriasAlteradas) => {
    setCategorias(prev =>
      prev.map(cat => {
        const alterada = categoriasAlteradas.find(c => c.id === cat.id);
        return alterada ? { ...cat, status: alterada.status } : cat;
      })
    );
  };

  return (
    <ProdutosContext.Provider
      value={{
        produtos: produtosComCategoria,
        categorias,
        loading,

        // produtos
        addProduto,
        updateProduto,
        removeProduto,
        updateProdutosStatus,

        // categorias
        addCategoria,
        updateCategoria,
        removeCategoria,
        updateCategoriasStatus
      }}
    >
      {children}
    </ProdutosContext.Provider>
  );
}

export const useProducts = () => useContext(ProdutosContext);
