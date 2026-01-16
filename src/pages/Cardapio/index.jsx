import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
import Typography from "@mui/material/Typography";

export default function Cardapio() {
  const { produtos, loading } = useProducts();
  const { categoria } = useParams();
  const { addItem } = useCarrinho();

  const [tipoPizza, setTipoPizza] = useState("inteira");
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const isPizzaCategoria = ["pizza", "broto"].includes(categoria);
  const isProdutoSimples = ["bebida", "esfiha"].includes(categoria);

  useEffect(() => {
    setTipoPizza("inteira");
    setSaboresSelecionados([]);
  }, [categoria]);


  const produtosFiltrados = produtos.filter(
    (p) => p.tipo === categoria && p.status
  );

  const bordas = produtos.filter(
    (p) => p.tipo === "borda" && p.status
  );

  const extrasDisponiveis = produtos.filter(
    (p) => p.tipo === "extra" && p.status
  );

  const selecionarProduto = (produto) => {
    // PRODUTO SIMPLES
    if (isProdutoSimples) {
      addItem({
        id: `${produto.tipo}-${produto.id}`,
        nome: produto.nome,
        valor: produto.valor,
        img: produto.img,
        tipo: produto.tipo,
        descricao: produto.descricao
      });
      return;
    }

    // PIZZA INTEIRA (pizza ou broto)
    if (tipoPizza === "inteira") {
      setSaboresSelecionados([produto]);
      setOpenModal(true);
      return;
    }

    // PIZZA / BROTO 1/2
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


  const onConfirmPizza = ({ sabores, borda, obs, precoFinal, extras }) => {
    const nomeSabores = sabores.map((s) => s.nome).join(" / ");

    const idPizza = `pizza-${categoria}-${sabores
      .map((s) => s.id)
      .sort()
      .join("-")}-${borda.id}-${extras.map((e) => e.id).join("-")}`;

    addItem({
      id: idPizza,
      nome: `(${categoria}) ${nomeSabores}`,
      valor: precoFinal,
      img: sabores[0].img,
      tipo: categoria,
      extras: {
        borda: borda.nome,
        adicionais: extras,
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
        Cardápio de {categoria}
      </Typography>

      {isPizzaCategoria && (
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
            tipoPizza={tipoPizza}
            selecionado={saboresSelecionados.some(
              (s) => s.id === produto.id
            )}
            onSelecionar={() => selecionarProduto(produto)}
          />
        ))}
      </Box>

      {openModal && isPizzaCategoria && saboresSelecionados.length > 0 && (
        <ModalExtras
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSaboresSelecionados([]);
          }}
          onConfirm={onConfirmPizza}
          sabores={saboresSelecionados}
          bordas={bordas}
          extrasDisponiveis={extrasDisponiveis}
        />

      )}
    </Box>
  );
}
