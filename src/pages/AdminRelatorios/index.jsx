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

function filtrarPedidos(pedidos, periodo) {
  const hoje = new Date();

  return pedidos.filter(p => {
    if (p.status !== "finalizado") return false;

    const d = toDate(p.createdAt);

    if (periodo === "hoje") {
      return (
        d.getDate() === hoje.getDate() &&
        d.getMonth() === hoje.getMonth() &&
        d.getFullYear() === hoje.getFullYear()
      );
    }

    if (periodo === "semana") {
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - 7);
      return d >= inicio;
    }

    if (periodo === "mes") {
      return (
        d.getMonth() === hoje.getMonth() &&
        d.getFullYear() === hoje.getFullYear()
      );
    }

    return true;
  });
}

function resolverCategoria(item, produtos, categorias) {
  // 1️⃣ Nova estrutura (ideal)
  if (item.categoriaNome) return item.categoriaNome;

  // 2️⃣ Estrutura intermediária
  if (item?.categoria?.nome) return item.categoria.nome;

  // 3️⃣ Produto atual pelo ID
  if (item.id) {
    const prod = produtos.find(p => p.id === item.id);

    if (prod?.categoriaId) {
      const cat = categorias.find(c => c.id === prod.categoriaId);
      if (cat?.nome) return cat.nome;
    }
  }

  // 4️⃣ Pizza mista antiga
  if (item?.sabores?.length) {
    const sabor = item.sabores[0];

    if (sabor?.categoria?.nome) return sabor.categoria.nome;

    const prod = produtos.find(p => p.id === sabor?.id);

    if (prod?.categoriaId) {
      const cat = categorias.find(c => c.id === prod.categoriaId);
      if (cat?.nome) return cat.nome;
    }
  }

  // 5️⃣ Último fallback
  return "Outros";
}

function gerarRelatorio(pedidos, produtos, categorias) {
  const r = {
    totalVendas: 0,
    totalPedidos: 0,
    totalEntregas: 0,
    totalRetirada: 0,
    pagamentos: {},
    categorias: {}
  };

  pedidos.forEach(p => {
    r.totalPedidos++;
    r.totalVendas += p.total || 0;

    if (p.retirarNaLoja) r.totalRetirada++;
    else r.totalEntregas++;

    const forma = p?.cliente?.formaPagamento?.forma || "NÃO INFORMADO";
    r.pagamentos[forma] =
      (r.pagamentos[forma] || 0) + p.total;

    p.itens?.forEach(item => {
      const nome = item.nome || "Sem nome";
      const qtd = item.quantidade || 1;
      const subtotal = (item.valor || 0) * qtd;

      const categoria = resolverCategoria(
        item,
        produtos,
        categorias
      );

      if (!r.categorias[categoria]) {
        r.categorias[categoria] = {};
      }

      if (!r.categorias[categoria][nome]) {
        r.categorias[categoria][nome] = {
          quantidade: 0,
          subtotal: 0
        };
      }

      r.categorias[categoria][nome].quantidade += qtd;
      r.categorias[categoria][nome].subtotal += subtotal;
    });
  });

  r.ticketMedio =
    r.totalPedidos > 0
      ? r.totalVendas / r.totalPedidos
      : 0;

  return r;
}

export default function RelatoriosPage() {
  const { pedidos, loading } = usePedidosRealtime();
  const { produtos, categorias } = useProducts();
  const [periodo, setPeriodo] = useState("hoje");

  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, periodo),
    [pedidos, periodo]
  );

  const relatorio = useMemo(
    () => gerarRelatorio(pedidosFiltrados, produtos, categorias),
    [pedidosFiltrados, produtos, categorias]
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📊 Relatórios
      </Typography>

      {/* Filtro */}
      <ToggleButtonGroup
        value={periodo}
        exclusive
        onChange={(e, v) => v && setPeriodo(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="hoje">Hoje</ToggleButton>
        <ToggleButton value="semana">Semana</ToggleButton>
        <ToggleButton value="mes">Mês</ToggleButton>
      </ToggleButtonGroup>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Kpi title="💰 Total vendas" value={relatorio.totalVendas} money />
        <Kpi title="🧾 Pedidos" value={relatorio.totalPedidos} />
        <Kpi title="📦 Ticket médio" value={relatorio.ticketMedio} money />
        <Kpi title="🚚 Entregas" value={relatorio.totalEntregas} />
        <Kpi title="🏪 Retirada" value={relatorio.totalRetirada} />
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