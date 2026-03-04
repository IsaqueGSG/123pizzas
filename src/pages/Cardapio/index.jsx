import { useEffect, useState } from "react";

import { useProducts } from "../../contexts/ProdutosContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";

import CardProduto from "../../components/CardProduto";
import ModalExtras from "../../components/ModalExtras";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export default function Cardapio() {
  const { produtos, categorias, loading } = useProducts();
  const { addItem } = useCarrinho();

  const [modoMisto, setModoMisto] = useState(false);
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const categoriasAtivas = categorias.filter(cat =>
    cat.status
  );

  const categoriaAtual = categoriasAtivas.find(
    c => c.id === categoriaSelecionada
  );

  const produtosAtivos = produtos.filter(p => p.status);

  const produtosFiltrados = produtosAtivos.filter(
    p => p.categoriaId === categoriaSelecionada
  );

  const produtosOrdednados = [...produtosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));

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


  useEffect(() => {
    if (categoriasAtivas.length && !categoriaSelecionada) {
      setCategoriaSelecionada(categoriasAtivas[0].id);
    }
  }, [categoriasAtivas]);

  return (
    <Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {(categoriasAtivas.length > 0 && categoriaSelecionada) ? (
        <Tabs
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
          value={categoriaSelecionada}
          onChange={(e, newValue) => setCategoriaSelecionada(newValue)}
        >
          {categoriasAtivas.map(cat => (
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


      <Box sx={{ p: 2, pt: 0 }}>
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
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",   // mantém 2 no celular
              sm: "repeat(3, 1fr)",   // 🔥 3 em telas maiores
              md: "repeat(auto-fill, minmax(220px, 1fr))",
              lg: "repeat(auto-fill, minmax(240px, 1fr))",
            },
            gap: 2,
          }}
        >
          {produtosOrdednados.map((produto) => (
            <CardProduto
              modoMisto={modoMisto}
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

              const extrasIds = [...extras]
                .map(e => e.id)
                .sort()
                .join("-");

              const obsId = observacao
                ? observacao.trim().toLowerCase().replace(/\s+/g, "_")
                : "sem_obs";

              const itemId = [
                produtoSelecionado.id,
                extrasIds,
                borda?.id || "sem_borda",
                obsId
              ].join("|");

              addItem({
                id: itemId,
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
    </Box>
  );
}
