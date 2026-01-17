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
  const { produtos, loading } = useProducts();
  const { addItem } = useCarrinho();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  const categorias = Array.from(
    new Set(
      produtos
        .filter(
          p => p.status && p.tipo !== "borda" && p.tipo !== "extra"
        )
        .map(p => p.tipo)
    )
  );

  useEffect(() => {
    if (categorias.length > 0 && !categoriaSelecionada) {
      setCategoriaSelecionada(categorias[0]);
    }
  }, [categorias, categoriaSelecionada]);


  const categoria = categoriaSelecionada;

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
    (p) => p.tipo === categoriaSelecionada && p.status
  );


  const bordas = produtos.filter(
    (p) => p.tipo === "borda" && p.status
  );

  const extrasDisponiveis = produtos.filter(
    (p) => p.tipo === "extra" && p.status
  );

  const selecionarProduto = (produto) => {

    console.log(produto)

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

    console.log("PREÇO FINAL:", precoFinal, typeof precoFinal);

    const nomeSabores = sabores.map((s) => s.nome).join(" / ");

    const idPizza = `${categoria}-${sabores
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

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {categorias.length > 0 && (
        <Tabs
          value={categoriaSelecionada || "pizza"}
          onChange={(e, newValue) => {
            setCategoriaSelecionada(newValue);
            setTipoPizza("inteira");
            setSaboresSelecionados([]);
          }}
          variant="fullWidth"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {categorias.map((cat) => (
            <Tab
              key={cat}
              value={cat}
              label={cat.toUpperCase()}
            />
          ))}
        </Tabs>
      )}


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
