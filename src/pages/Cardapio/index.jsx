import { useEffect, useState, useMemo } from "react";

import { useProducts } from "../../contexts/ProdutosContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";

import CardProduto from "../../components/CardProduto";
import ModalExtras from "../../components/ModalExtras";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LockClockIcon from "@mui/icons-material/LockClock";

export default function Cardapio() {
  const { produtos, categorias, loading } = useProducts();
  const { addItem } = useCarrinho();

  const [modoMisto, setModoMisto] = useState(false);
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  function categoriaDisponivel(cat) {
    const inicio = cat?.horarioFuncionamento?.inicio;
    const fim = cat?.horarioFuncionamento?.fim;

    if (!inicio || !fim) return true;

    const agora = new Date();
    const horaAtual = agora.toTimeString().slice(0, 5);

    if (inicio <= fim) {
      return horaAtual >= inicio && horaAtual <= fim;
    }

    // caso passe da meia-noite
    return horaAtual >= inicio || horaAtual <= fim;
  }

  const categoriasAtivas = categorias.filter(cat => cat.status);

  useEffect(() => {
    if (!categoriasAtivas.find(c => c.id === categoriaSelecionada)) {
      setCategoriaSelecionada(categoriasAtivas[0]?.id || null);
    }
  }, [categoriasAtivas, categoriaSelecionada]);

  const categoriasOrdenadas = useMemo(() => {
    return [...categoriasAtivas].sort((a, b) => {
      const aDisponivel = categoriaDisponivel(a);
      const bDisponivel = categoriaDisponivel(b);

      // primeiro disponíveis
      if (aDisponivel !== bDisponivel) {
        return aDisponivel ? -1 : 1;
      }

      // depois pela posição
      return (a.posicao ?? 0) - (b.posicao ?? 0);
    });
  }, [categoriasAtivas]);

  const categoriaAtual = categoriasAtivas.find(
    c => c.id === categoriaSelecionada
  );

  const categoriaAberta = categoriaAtual
    ? categoriaDisponivel(categoriaAtual)
    : false;

  const produtosFiltrados = produtos.filter(p => p.status && p.categoriaId === categoriaSelecionada);

  const produtosOrdednados = [...produtosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));

  const abrirModalOuAdicionar = (produto) => {
    // se tiver extras ou bordas → abrir modal
    if (produto.categoria?.extras?.length || produto.categoria?.bordas?.length) {
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
    if (categoriasOrdenadas.length && !categoriaSelecionada) {
      setCategoriaSelecionada(categoriasOrdenadas[0].id);
    }
  }, [categoriasOrdenadas]);

  return (
    <Box>

      {loading && (
        <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (categoriasAtivas.length > 0 && categoriaSelecionada) ? (
        <Tabs
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
          value={categoriaSelecionada}
          onChange={(e, newValue) => setCategoriaSelecionada(newValue)}
        >
          {categoriasOrdenadas.map(cat => (
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

      <Box sx={{ p: 2, pt: 0, position: "relative" }}>

        {categoriaAtual && !categoriaAberta && (
          <Card
            sx={{
              my: 1,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f5f5f5, #fafafa)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 1
              }}
            >
              <LockClockIcon sx={{ fontSize: 36, opacity: 0.7 }} />

              <Typography variant="h6" fontWeight={600}>
                Produtos indisponíveis agora
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Disponível das{" "}
                <strong>{categoriaAtual?.horarioFuncionamento?.inicio}</strong>
                {" "}às{" "}
                <strong>{categoriaAtual?.horarioFuncionamento?.fim}</strong>
              </Typography>
            </CardContent>
          </Card>
        )}

        {categoriaAtual?.permiteMisto && (
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant={!modoMisto ? "contained" : "outlined"}
              disabled={categoriaAtual && !categoriaAberta}
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
              disabled={categoriaAtual && !categoriaAberta}
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
              foraDeHorario={categoriaAtual && !categoriaAberta}
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
    </Box >
  );
}
