import { useState } from "react";
import { useParams } from "react-router-dom";

import { useProducts } from "../../contexts/ProdutosContext";
import CardProduto from "../../components/CardProduto";
import PizzaModal from "../../components/PizzaModal";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useCarrinho } from "../../contexts/CarrinhoContext";

const tamanhosPizza = {
  pizza: { nome: "Família", fator: 1 },
  broto: { nome: "Broto", fator: 0.75 }
};

export default function Cardapio() {
  const { produtos, loading } = useProducts();
  const { categoria } = useParams();

  const [tipoPizza, setTipoPizza] = useState("inteira");
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const produtosFiltrados = produtos.filter((p) => {
    if (categoria === "pizza" || categoria === "broto") return p.tipo === "pizza";
    if (categoria === "bebida") return p.tipo === "bebida";
    return false;
  });

  const selecionarSabor = (produto) => {
    // 👉 BEBIDA
    if (produto.tipo === "bebida") {
      addItem({
        id: `bebida-${produto.id}-${Date.now()}`,
        nome: produto.nome,
        preco: produto.valor,
        quantidade: 1,
        img: produto.img
      });
      return;
    }

    // 👉 PIZZA INTEIRA
    if (tipoPizza === "inteira") {
      setSaboresSelecionados([produto]);
      setOpenModal(true);
      return;
    }

    // 👉 PIZZA 1/2
    const existe = saboresSelecionados.find((s) => s.id === produto.id);

    if (existe) {
      setSaboresSelecionados(
        saboresSelecionados.filter((s) => s.id !== produto.id)
      );
      return;
    }

    if (saboresSelecionados.length < 2) {
      const novos = [...saboresSelecionados, produto];
      setSaboresSelecionados(novos);

      if (novos.length === 2) {
        setOpenModal(true);
      }
    }
  };


  const { addItem } = useCarrinho();
  const onConfirmPizza = ({ sabores, borda, obs, precoFinal }) => {
    const tamanho = tamanhosPizza[categoria];

    const nomeSabores = sabores.map((s) => s.nome).join(" / ");

    addItem({
      id: `pizza-${Date.now()}`,
      nome: `Pizza ${nomeSabores} (${tamanho.nome})`,
      preco: precoFinal,
      quantidade: 1,
      img: sabores[0].img,
      extras: {
        borda: borda.nome,
        obs
      }
    });

    setOpenModal(false);
    setSaboresSelecionados([]);
  };


  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <CarrinhoDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Cardápio
      </Typography>

      {categoria !== "bebidas" && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant={tipoPizza === "inteira" ? "contained" : "outlined"}
            onClick={() => {
              setTipoPizza("inteira");
              setSaboresSelecionados([]);
            }}
          >
            Inteira
          </Button>

          <Button
            fullWidth
            variant={tipoPizza === "1/2" ? "contained" : "outlined"}
            onClick={() => {
              setTipoPizza("1/2");
              setSaboresSelecionados([]);
            }}
          >
            1/2
          </Button>
        </Box>
      )}

      {loading && <CircularProgress />}

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
            selecionado={saboresSelecionados.some(
              (s) => s.id === produto.id
            )}
            onSelecionar={() => selecionarSabor(produto)}
          />
        ))}
      </Box>

      {/* MODAL */}
      {openModal && categoria !== "bebida" && saboresSelecionados.length > 0 && (
        <PizzaModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSaboresSelecionados([]);
          }}
          sabores={saboresSelecionados}
          tamanho={tamanhosPizza[categoria]}
          onConfirm={onConfirmPizza}
        />
      )}

    </Box>
  );
}
