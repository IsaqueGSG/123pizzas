import { useEffect, useState } from "react";

import { useProducts } from "../../contexts/ProdutosContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";

import CardProduto from "../../components/CardProduto";
import ModalExtras from "../../components/ModalExtras";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export default function Cardapio() {
  const { produtos, categorias, loading } = useProducts();

  console.log("Categorias:", categorias);
  console.log("Produtos:", produtos);

  const { addItem } = useCarrinho();

  const [modoMisto, setModoMisto] = useState(false);
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    if (categorias.length && !categoriaSelecionada) {
      setCategoriaSelecionada(categorias[0].id);
    }
  }, [categorias]);

  const categoriaAtual = categorias.find(
    c => c.id === categoriaSelecionada
  );

  const produtosFiltrados = produtos.filter(
    p => p.categoriaId === categoriaSelecionada
  );

  const abrirModalOuAdicionar = (produto) => {
    if (produto.categoria?.extras?.length) {
      setProdutoSelecionado(produto);
      setOpenModal(true);
      return;
    }

    addItem({
      id: produto.id,
      nome: produto.nome,
      valor: produto.valor,
      img: produto.img
    });
  };


  const selecionarProduto = (produto) => {
    // PRODUTO INTEIRO
    if (!modoMisto) {
      abrirModalOuAdicionar(produto);
      return;
    }

    // PRODUTO MISTO
    setSaboresSelecionados(prev => {
      // desmarca se clicar de novo
      if (prev.some(p => p.id === produto.id)) {
        return prev.filter(p => p.id !== produto.id);
      }

      // máximo 2 sabores
      if (prev.length === 2) return prev;

      const novos = [...prev, produto];

      // quando fechar 2 sabores → abrir modal
      if (novos.length === 2) {
        const [p1, p2] = novos;

        const produtoMisto = {
          id: `misto-${p1.id}-${p2.id}`,
          nome: `${p1.nome} / ${p2.nome}`,
          valor: Math.max(p1.valor, p2.valor),
          img: p1.img,
          misto: true,
          sabores: [p1, p2],
          categoria: categoriaAtual // importante para extras
        };

        setProdutoSelecionado(produtoMisto);
        setOpenModal(true);
      }

      return novos;
    });
  };

  useEffect(() => {
    setModoMisto(false);
    setSaboresSelecionados([]);
  }, [categoriaSelecionada]);

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <CarrinhoDrawer />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {(categorias.length > 0 && categoriaSelecionada) ? (
        <Tabs
          sx={{ mb: 2 }}
          variant="fullWidth"
          value={categoriaSelecionada}
          onChange={(e, newValue) => setCategoriaSelecionada(newValue)}
        >
          {categorias.map(cat => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={cat.nome}
            />
          ))}
        </Tabs>
      ) : (
        <h1>Ainda nao há produtos nessa Loja</h1>
      )}

      {categoriaAtual?.permiteMisto && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant={!modoMisto ? "contained" : "outlined"}
            onClick={() => {
              setModoMisto(false);
              setSaboresSelecionados([]);
            }}
          >
            Inteira
          </Button>

          <Button
            fullWidth
            variant={modoMisto ? "contained" : "outlined"}
            onClick={() => {
              setModoMisto(true);
              setSaboresSelecionados([]);
            }}
          >
            1/2
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2
        }}
      >
        {produtosFiltrados.map((produto) => (
          <CardProduto
            produto={produto}
            key={produto.id}
            selecionado={saboresSelecionados.some(s => s.id === produto.id)}
            onSelecionar={() => selecionarProduto(produto)}
          />
        ))}
      </Box>

      {openModal && produtoSelecionado && (
        <ModalExtras
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setProdutoSelecionado(null);
            setSaboresSelecionados([]);
          }}
          produto={produtoSelecionado}
          extrasDisponiveis={produtoSelecionado.categoria.extras}
          bordasDisponiveis={produtoSelecionado.categoria.bordas} // <--- bordas aqui
          onConfirm={({ extras, borda, observacao, precoFinal }) => {
            addItem({
              id: produtoSelecionado.id + "-" + extras.map(e => e.id).join("-") + (borda?.id ? `-${borda.id}` : ""),
              nome: produtoSelecionado.nome,
              valor: precoFinal,
              img: produtoSelecionado.img,
              extras,
              borda,
              observacao,
              misto: produtoSelecionado.misto || false,
              sabores: produtoSelecionado.sabores || []
            });

            setOpenModal(false);
            setProdutoSelecionado(null);
            setSaboresSelecionados([]);
          }}
        />

      )}

    </Box>
  );
}
