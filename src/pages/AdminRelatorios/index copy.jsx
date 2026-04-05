import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  CircularProgress
} from "@mui/material";

import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";
import { useProducts } from "../../contexts/ProdutosContext";

function toDate(ts) {
  return new Date(ts.seconds * 1000);
}

function filtrarPedidos(pedidos, filtros) {
  return pedidos.filter(p => {
    if (p.status !== "finalizado") return false;

    const dataPedido = toDate(p.createdAt);

    // 🔥 intervalo completo (data + hora)
    if (filtros.dataHoraInicio) {
      const inicio = new Date(filtros.dataHoraInicio);
      if (dataPedido < inicio) return false;
    }

    if (filtros.dataHoraFim) {
      const fim = new Date(filtros.dataHoraFim);
      if (dataPedido > fim) return false;
    }

    // 🚚 Tipo
    if (filtros.tipo === "entrega" && p.retirarNaLoja) return false;
    if (filtros.tipo === "retirada" && !p.retirarNaLoja) return false;

    return true;
  });
}

function resolverCategoria(item, produtos, categorias) {
  if (!item) return "Outros";

  // 1️⃣ Nova estrutura
  if (item.categoriaNome?.trim()) {
    return item.categoriaNome.trim();
  }

  // 2️⃣ Estrutura intermediária
  if (item?.categoria?.nome?.trim()) {
    return item.categoria.nome.trim();
  }

  // 3️⃣ Produto pelo ID
  if (item.id && Array.isArray(produtos)) {
    const prod = produtos.find(p => p.id === item.id);

    if (prod?.categoriaId && Array.isArray(categorias)) {
      const cat = categorias.find(c => c.id === prod.categoriaId);
      if (cat?.nome) return cat.nome;
    }
  }

  // 4️⃣ Sabores (PIZZA)
  if (Array.isArray(item.sabores) && item.sabores.length > 0) {
    const sabor = item.sabores[0];

    if (sabor?.categoria?.nome) {
      return sabor.categoria.nome;
    }

    if (sabor?.id && Array.isArray(produtos)) {
      const prod = produtos.find(p => p.id === sabor.id);

      if (prod?.categoriaId && Array.isArray(categorias)) {
        const cat = categorias.find(c => c.id === prod.categoriaId);
        if (cat?.nome) return cat.nome;
      }
    }
  }

  return "Outros";
}

function gerarRelatorio(pedidos, produtos, categorias, filtros) {
  const r = {
    totalVendas: 0,
    totalPedidos: 0,

    totalEntrega: 0,
    totalRetirada: 0,

    valorEntrega: 0,
    valorRetirada: 0,

    taxaEntrega: 0,

    pagamentos: {
      dinheiro: 0,
      cartao: 0,
      pix: 0,
      outros: 0
    },

    categorias: {}
  };

  pedidos.forEach(p => {
    r.totalPedidos++;
    r.totalVendas += p.total || 0;

    if (p.retirarNaLoja) {
      r.totalRetirada++;
      r.valorRetirada += p.total || 0;
    } else {
      r.totalEntrega++;
      r.valorEntrega += p.total || 0;
      r.taxaEntrega += p.taxaEntrega || 0;
    }

    // 💳 Pagamentos
    const forma = (p?.cliente?.formaPagamento?.forma || "").toLowerCase();

    if (forma.includes("dinheiro")) {
      r.pagamentos.dinheiro += p.total;
    } else if (forma.includes("pix")) {
      r.pagamentos.pix += p.total;
    } else if (forma.includes("cart")) {
      r.pagamentos.cartao += p.total;
    } else {
      r.pagamentos.outros += p.total;
    }

    // 🍕 Categorias
    p.itens?.forEach(item => {
      const categoria = resolverCategoria(item, produtos, categorias);

      if (filtros.categoria !== "todas" && filtros.categoria !== categoria) {
        return;
      }

      if (!r.categorias[categoria]) r.categorias[categoria] = {};

      const nome = item.nome;
      const qtd = item.quantidade || 1;
      const subtotal = item.valor * qtd;

      if (!r.categorias[categoria][nome]) {
        r.categorias[categoria][nome] = { quantidade: 0, subtotal: 0 };
      }

      r.categorias[categoria][nome].quantidade += qtd;
      r.categorias[categoria][nome].subtotal += subtotal;
    });
  });

  return r;
}

export default function RelatoriosPage() {
  const { pedidos, loading } = usePedidosRealtime();
  const { produtos, categorias } = useProducts();

  console.log(pedidos[0]);
  console.log(produtos);
  console.log(categorias);

  const agora = new Date();

  const [filtros, setFiltros] = useState({
    dataHoraInicio: new Date(agora.setHours(0, 0, 0, 0))
      .toISOString()
      .slice(0, 16),

    dataHoraFim: new Date()
      .toISOString()
      .slice(0, 16),

    tipo: "todos",
    categoria: "todas"
  });

  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, filtros),
    [pedidos, filtros]
  );

  const relatorio = useMemo(
    () => gerarRelatorio(pedidosFiltrados, produtos, categorias, filtros),
    [pedidosFiltrados, produtos, categorias, filtros]
  );

  const pagamentosOrdenados = Object.entries(
    relatorio.pagamentos || {}
  )
    .map(([forma, total]) => ({ forma, total }))
    .sort((a, b) => b.total - a.total);

  if (loading) {
    return (
      <Box p={5} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} pb={12}>
      <Typography variant="h4" gutterBottom>
        📊 Relatórios
      </Typography>

      {/* Filtro */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>

        <input
          type="datetime-local"
          onChange={(e) =>
            setFiltros(f => ({ ...f, dataHoraInicio: e.target.value }))
          }
        />

        <input
          type="datetime-local"
          onChange={(e) =>
            setFiltros(f => ({ ...f, dataHoraFim: e.target.value }))
          }
        />

      </Box>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Kpi title="💰 Total" value={relatorio.totalVendas} money />
        <Kpi title="🚚 Entrega" value={relatorio.valorEntrega} money />
        <Kpi title="🏪 Retirada" value={relatorio.valorRetirada} money />
        <Kpi title="📦 Taxa entrega" value={relatorio.taxaEntrega} money />
        <Kpi title="💵 Dinheiro" value={relatorio.pagamentos.dinheiro} money />
        <Kpi title="💳 Cartão" value={relatorio.pagamentos.cartao} money />
        <Kpi title="🟣 Pix" value={relatorio.pagamentos.pix} money />
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Pagamentos */}
      <Typography variant="h5" gutterBottom>
        💳 Formas de pagamento
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Forma</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagamentosOrdenados.map(p => (
            <TableRow key={p.forma}>
              <TableCell>{p.forma}</TableCell>
              <TableCell align="right">
                R$ {p.total.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 4 }} />

      {/* Produtos */}
      <Typography variant="h5" gutterBottom>
        🍕 Produtos por categoria
      </Typography>

      {Object.keys(relatorio.categorias || {}).length === 0 && (
        <Typography color="text.secondary">
          Nenhum produto encontrado no período.
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(auto-fill, minmax(340px, 1fr))"
          },
          gap: 2
        }}
      >
        {Object.entries(relatorio.categorias || {}).map(
          ([categoria, produtos]) => {
            const lista = Object.entries(produtos)
              .map(([nome, d]) => ({ nome, ...d }))
              .sort((a, b) => b.quantidade - a.quantidade);

            const totalQtd = lista.reduce(
              (acc, p) => acc + p.quantidade,
              0
            );

            const totalValor = lista.reduce(
              (acc, p) => acc + p.subtotal,
              0
            );

            return (
              <Box key={categoria}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    height: "100%"
                  }}
                >
                  <CardContent>

                    {/* Cabeçalho */}
                    <Typography variant="h6" fontWeight={600}>
                      {categoria}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {totalQtd} itens vendidos • R$ {totalValor.toFixed(2)}
                    </Typography>

                    <Divider sx={{ mb: 1 }} />

                    {/* Tabela limpa */}
                    <Table size="small">
                      <TableBody>
                        {lista.map((p, i) => (
                          <TableRow key={p.nome} hover>

                            {/* Ranking + Nome */}
                            <TableCell sx={{ borderBottom: "none" }}>
                              <Box display="flex" alignItems="center" gap={1}>

                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color={
                                    i === 0
                                      ? "warning.main"
                                      : "text.secondary"
                                  }
                                >
                                  {i === 0
                                    ? "🥇"
                                    : i === 1
                                      ? "🥈"
                                      : i === 2
                                        ? "🥉"
                                        : `${i + 1}º`}
                                </Typography>

                                <Typography variant="body2" fontWeight={500}>
                                  {p.nome}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Quantidade */}
                            <TableCell
                              align="right"
                              sx={{
                                borderBottom: "none",
                                fontWeight: 600
                              }}
                            >
                              {p.quantidade}
                            </TableCell>

                            {/* Valor */}
                            <TableCell
                              align="right"
                              sx={{
                                borderBottom: "none",
                                color: "text.secondary"
                              }}
                            >
                              R$ {p.subtotal.toFixed(2)}
                            </TableCell>

                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                  </CardContent>
                </Card>
              </Box>
            );
          }
        )}
      </Box>

    </Box>
  );
}

function Kpi({ title, value, money }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h5">
            {money ? `R$ ${value.toFixed(2)}` : value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}