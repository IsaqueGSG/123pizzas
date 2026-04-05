import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";

import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";
import { useProducts } from "../../contexts/ProdutosContext";

/* ---------------- utils ---------------- */

function toDate(ts) {
  return new Date(ts.seconds * 1000);
}

// resolve categoria (robusto)
function getCategoria(item) {
  return (
    item?.categoriaNome ||
    item?.categoria?.nome ||
    "Outros"
  );
}

// resolve pagamento
function getPagamento(p) {
  return (p?.cliente?.formaPagamento?.forma || "").toLowerCase();
}

/* ---------------- filtro ---------------- */

function filtrarPedidos(pedidos, filtros) {
  return pedidos.filter(p => {
    if (p.status !== "finalizado") return false;

    const data = toDate(p.createdAt);

    if (filtros.inicio && data < new Date(filtros.inicio)) return false;
    if (filtros.fim && data > new Date(filtros.fim)) return false;

    // tipo
    if (filtros.tipo === "entrega" && p.retirarNaLoja) return false;
    if (filtros.tipo === "retirada" && !p.retirarNaLoja) return false;

    // pagamento
    if (filtros.pagamento !== "todos") {
      const forma = getPagamento(p);
      if (!forma.includes(filtros.pagamento)) return false;
    }

    return true;
  });
}

/* ---------------- relatório ---------------- */

function gerarRelatorio(pedidos) {
  let total = 0;
  let pedidosQtd = 0;
  let entrega = 0;
  let retirada = 0;
  let taxaEntrega = 0;

  const pagamentos = {};
  const categorias = {};

  pedidos.forEach(p => {
    pedidosQtd++;
    total += p.total || 0;

    if (p.retirarNaLoja) {
      retirada += p.total;
    } else {
      entrega += p.total;
      taxaEntrega += p.cliente?.endereco?.taxaEntrega || 0;
    }

    // pagamento
    const forma = getPagamento(p);
    pagamentos[forma] = (pagamentos[forma] || 0) + p.total;

    // itens
    p.itens?.forEach(item => {
      const cat = getCategoria(item);

      if (!categorias[cat]) categorias[cat] = {};

      const nome = item.nome;
      const qtd = item.quantidade || 1;
      const subtotal = qtd * item.valor;

      if (!categorias[cat][nome]) {
        categorias[cat][nome] = { qtd: 0, total: 0 };
      }

      categorias[cat][nome].qtd += qtd;
      categorias[cat][nome].total += subtotal;
    });
  });

  return {
    total,
    pedidosQtd,
    entrega,
    retirada,
    taxaEntrega,
    ticketMedio: pedidosQtd ? total / pedidosQtd : 0,
    pagamentos,
    categorias
  };
}

/* ---------------- componente ---------------- */

export default function RelatoriosPage() {
  const { pedidos, loading } = usePedidosRealtime();

  const agora = new Date();

  const [filtros, setFiltros] = useState({
    inicio: new Date(agora.setHours(0, 0, 0, 0))
      .toISOString()
      .slice(0, 16),
    fim: new Date().toISOString().slice(0, 16),
    tipo: "todos",
    pagamento: "todos"
  });

  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, filtros),
    [pedidos, filtros]
  );

  const r = useMemo(
    () => gerarRelatorio(pedidosFiltrados),
    [pedidosFiltrados]
  );

  if (loading) {
    return (
      <Box p={5} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} pb={10}>




      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Typography variant="h4" gutterBottom>
          📊 Relatório de Fechamento
        </Typography>

        {/* ---------------- FILTROS ---------------- */}
        <input
          type="datetime-local"
          value={filtros.inicio}
          onChange={e =>
            setFiltros(f => ({ ...f, inicio: e.target.value }))
          }
        />

        <input
          type="datetime-local"
          value={filtros.fim}
          onChange={e =>
            setFiltros(f => ({ ...f, fim: e.target.value }))
          }
        />

        <FormControl>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filtros.tipo}
            label="Tipo"
            onChange={e =>
              setFiltros(f => ({ ...f, tipo: e.target.value }))
            }
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="entrega">Entrega</MenuItem>
            <MenuItem value="retirada">Retirada</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Pagamento</InputLabel>
          <Select
            value={filtros.pagamento}
            label="Pagamento"
            onChange={e =>
              setFiltros(f => ({ ...f, pagamento: e.target.value }))
            }
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="pix">PIX</MenuItem>
            <MenuItem value="dinheiro">Dinheiro</MenuItem>
            <MenuItem value="cart">Cartão</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ---------------- KPIs ---------------- */}

      <Grid container spacing={2}>
        <Kpi title="Total" value={r.total} />
        <Kpi title="Pedidos" value={r.pedidosQtd} />
        <Kpi title="Ticket Médio" value={r.ticketMedio} />
        <Kpi title="Entrega" value={r.entrega} />
        <Kpi title="Retirada" value={r.retirada} />
        <Kpi title="Taxa Entrega" value={r.taxaEntrega} />

        {/* Pagamentos */}
        {Object.entries(r.pagamentos).map(([k, v]) => (
          <Kpi title={k} value={v} />
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* ---------------- PRODUTOS ---------------- */}

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)"
          },
          gap: 2
        }}
      >
        {Object.entries(r.categorias).map(([cat, produtos]) => {
          const lista = Object.entries(produtos)
            .map(([nome, d]) => ({ nome, ...d }))
            .sort((a, b) => b.qtd - a.qtd);

          const totalQtd = lista.reduce((acc, p) => acc + p.qtd, 0);
          const totalValor = lista.reduce((acc, p) => acc + p.total, 0);

          return (
            <Card
              key={cat}
              sx={{
                borderRadius: 3,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                height: "100%"
              }}
            >
              <CardContent>
                {/* Header */}
                <Typography variant="h6" fontWeight={600}>
                  {cat}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {totalQtd} itens • R$ {totalValor.toFixed(2)}
                </Typography>

                <Divider sx={{ mb: 1 }} />

                {/* Lista */}
                {lista.map((p, i) => (
                  <Box key={p.nome} display="flex" justifyContent="space-between">
                    <Typography key={p.nome}>
                      {i + 1}º - {p.nome} ({p.qtd})
                    </Typography>
                    <Typography key={p.nome}>
                      R$ {(p.total || 0).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

/* ---------------- KPI ---------------- */

function Kpi({ title, value }) {
  return (
    <Grid item xs={6} md={2}>
      <Card>
        <CardContent>
          <Typography>{title}</Typography>
          <Typography variant="h6">
            R$ {value.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}