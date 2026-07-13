import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Verifica se a tela é menor que 'sm' (600px)

  // O MUI usa 56px para AppBar em dispositivos móveis e 64px em desktop
  const appBarHeight = isMobile ? 56 : 64;

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

  const produtosOrdenados = useMemo(() => {
    return produtos
      .filter(p => p.status && p.categoriaId === categoriaSelecionada)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, categoriaSelecionada]); // Só roda se os produtos ou a categoria mudarem

  const abrirModalOuAdicionar = (produto) => {
    // se tiver extras ou bordas → abrir modal
    if (produto.categoria?.gruposExtras?.length > 0) {
      setProdutoSelecionado(produto);
      setOpenModal(true);
      return;
    }

    addItem({
      id: produto.id,
      nome: produto.nome,
      valor: produto.valor,
      img: produto.img,
      categoriaId: produto.categoriaId,
      categoriaNome: produto.categoria?.nome || "Sem categoria"
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
          categoria: categoriaAtual,// importante para extras
          categoriaId: categoriaAtual.id,
          categoriaNome: categoriaAtual.nome
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
        <Box
          sx={{
            position: "sticky",
            top: appBarHeight, // se tela grande 64, se tela pequena 56 (altura do AppBar)
            zIndex: 10,
            backgroundColor: "background.default", // Importante: fundo sólido para não ver os produtos passando atrás
          }}
        >
          {/* Abas de Categorias */}
          <Tabs
            sx={{ mb: 1 }}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            value={categoriaSelecionada}
            onChange={(e, newValue) => setCategoriaSelecionada(newValue)}
          >
            {categoriasOrdenadas.map(cat => (
              <Tab key={cat.id} value={cat.id} label={cat.nome} />
            ))}
          </Tabs>

          {/* Botões de Modo Misto (Inteira / Meia) */}
          {categoriaAtual?.permiteMisto && (
            <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1 }}>
              <Button
                size="small"
                fullWidth
                variant={!modoMisto ? "contained" : "outlined"}
                disabled={categoriaAtual && !categoriaAberta}
                onClick={() => { setModoMisto(false); setSaboresSelecionados([]); }}
              >
                Inteira
              </Button>
              <Button
                size="small"
                fullWidth
                variant={modoMisto ? "contained" : "outlined"}
                disabled={categoriaAtual && !categoriaAberta}
                onClick={() => { setModoMisto(true); setSaboresSelecionados([]); }}
              >
                1/2 (2 Sabores)
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <h1>Ainda nao há produtos nessa Loja</h1>
      )}

      <Box sx={{ p: 2, position: "relative" }}>

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
          {produtosOrdenados.map((produto) => (
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
              setModoMisto(false);
            }}
            produto={produtoSelecionado}
            onConfirm={({ selecoes, observacao, precoFinal }) => {

              const selecoesIds = Object.entries(selecoes)
                .map(([grupoId, itens]) =>
                  `${grupoId}:${itens.map(i => i.id).sort().join(",")}`
                )
                .sort()
                .join("|");

              const obsId = observacao
                ? observacao.trim().toLowerCase().replace(/\s+/g, "_")
                : "sem_obs";

              const itemId = [
                produtoSelecionado.id,
                selecoesIds || "sem_extras",
                obsId
              ].join("|");

              const selecoesComGrupo = {};

              Object.entries(selecoes).forEach(([grupoId, itens]) => {
                const grupo = produtoSelecionado.categoria.gruposExtras.find(g => g.id === grupoId);

                selecoesComGrupo[grupoId] = {
                  nome: grupo.nome,
                  itens
                };
              });

              addItem({
                id: itemId,
                nome: produtoSelecionado.nome,
                valor: precoFinal,
                img: produtoSelecionado.img,

                categoriaId: produtoSelecionado.categoria?.id,
                categoriaNome: produtoSelecionado.categoria?.nome,

                selecoes: selecoesComGrupo,
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
