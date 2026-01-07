import { useProducts } from "../../contexts/ProdutosContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";
import CardProduto from "../../components/CardProduto";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useState } from "react";
import { useParams } from "react-router-dom";

const Cardapio = () => {
  const { produtos, loading } = useProducts();
  const { addItem } = useCarrinho();
  const { categoria } = useParams();

  const [tipoPizza, setTipoPizza] = useState("inteira"); // inteira | "1/2"
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);

  const produtosFiltrados = produtos.filter((p) => {
    if (categoria === "pizza" || categoria === "broto") return p.tipo === "pizza";
    if (categoria === "bebida") return p.tipo === "bebida";
    return false;
  });

  const toggleSabor = (produto) => {
    setSaboresSelecionados((prev) => {
      const existe = prev.find((p) => p.id === produto.id);

      if (existe) {
        return prev.filter((p) => p.id !== produto.id);
      }

      if (prev.length === 2) return prev;

      return [...prev, produto];
    });
  };

  const adicionarPizzaMeia = () => {
    if (saboresSelecionados.length !== 2) return;

    const [s1, s2] = saboresSelecionados;
    const maiorPreco = Math.max(s1.valor, s2.valor);
    const fator = categoria === "broto" ? 0.75 : 1;

    addItem({
      id: `pizza-1-2-${s1.id}-${s2.id}-${categoria}`,
      nome: `Pizza 1/2 ${s1.nome} + ${s2.nome}`,
      preco: maiorPreco * fator,
      quantidade: 1
    });

    setSaboresSelecionados([]);
    setTipoPizza("inteira");
  };

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

      {/* BOTÕES DE MODO */}
      {!loading && categoria !== "bebida" && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant={tipoPizza === "inteira" ? "contained" : "outlined"}
            onClick={() => {
              setTipoPizza("inteira");
              setSaboresSelecionados([]);
            }}
          >
            Inteira (1 sabor)
          </Button>

          <Button
            fullWidth
            variant={tipoPizza === "1/2" ? "contained" : "outlined"}
            onClick={() => setTipoPizza("1/2")}
          >
            1/2 (2 sabores)
          </Button>
        </Box>
      )}

      {/* LISTA */}
      {!loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2
          }}
        >
          {produtosFiltrados.map((produto) => (
            <CardProduto
              key={produto.id}
              produto={produto}
              categoria={categoria}
              tipoPizza={tipoPizza}
              saboresSelecionados={saboresSelecionados}
              onSelecionarSabor={toggleSabor}
            />
          ))}
        </Box>
      )}

      {/* BOTÃO FINAL 1/2 */}
      {tipoPizza === "1/2" && saboresSelecionados.length === 2 && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            mt: 2,
            p: 2,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider"
          }}
        >
          <Typography fontSize={14} mb={1}>
            Sabores:
            <br />
            • {saboresSelecionados[0].nome}
            <br />
            • {saboresSelecionados[1].nome}
          </Typography>

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={adicionarPizzaMeia}
          >
            Adicionar pizza 1/2
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Cardapio;
