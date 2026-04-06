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
  CircularProgress,
  Checkbox,
  FormControlLabel
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
    // status
    if (!filtros.incluirCancelados && p.status !== "finalizado") return false;

    const data = toDate(p.createdAt);

    if (filtros.inicio && data < new Date(filtros.inicio)) return false;
    if (filtros.fim && data > new Date(filtros.fim)) return false;

    if (filtros.tipo === "entrega" && p.retirarNaLoja) return false;
    if (filtros.tipo === "retirada" && !p.retirarNaLoja) return false;

    if (filtros.pagamento !== "todos") {
      const forma = getPagamento(p);
      if (!forma.includes(filtros.pagamento)) return false;
    }

    return true;
  });
}

/* ---------------- relatório ---------------- */

function gerarRelatorio(pedidos, filtros) {
  let total = 0;
  let totalSemTaxa = 0;
  let pedidosQtd = 0;

  let entrega = 0;
  let retirada = 0;

  let taxaEntrega = 0;

  let qtdPedidosEntrega = 0;
  let qtdPedidosRetirada = 0;

  const pagamentos = {};
  const categorias = {};

  pedidos.forEach(p => {
    const taxa = p.cliente?.endereco?.taxaEntrega || 0;
    const valorPedido = (p.total || 0) - taxa;

    pedidosQtd++;

    total += filtros.incluirTaxaEntrega ? p.total : valorPedido;
    totalSemTaxa += valorPedido;

    if (!p.retirarNaLoja) {
      entrega += p.total;
      qtdPedidosEntrega++;

      if (filtros.incluirTaxaEntrega) {
        taxaEntrega += taxa;
      }
    } else {
      retirada += p.total;
      qtdPedidosRetirada++;
    }

    // pagamento
    const forma = getPagamento(p);
    pagamentos[forma] = (pagamentos[forma] || 0) + p.total;

    // produtos
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
    totalSemTaxa,
    pedidosQtd,
    entrega,
    retirada,
    taxaEntrega,
    qtdPedidosEntrega,
    qtdPedidosRetirada,
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
    pagamento: "todos",
    incluirCancelados: false,
    incluirTaxaEntrega: true
  });

  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, filtros),
    [pedidos, filtros]
  );

  const r = useMemo(
    () => gerarRelatorio(pedidosFiltrados, filtros),
    [pedidosFiltrados, filtros]
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
          Relatórios
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

        <FormControlLabel
          control={
            <Checkbox
              checked={filtros.incluirCancelados}
              onChange={e =>
                setFiltros(f => ({ ...f, incluirCancelados: e.target.checked }))
              }
            />
          }
          label="Incluir Cancelados"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filtros.incluirTaxaEntrega}
              onChange={e =>
                setFiltros(f => ({ ...f, incluirTaxaEntrega: e.target.checked }))
              }
            />
          }
          label="Incluir Taxa de Entrega"
        />

      </Box>

      {/* ---------------- KPIs ---------------- */}
      <TotaisSection r={r} />
      <Divider sx={{ my: 3 }} />

      <MotoboySection r={r} />
      <Divider sx={{ my: 3 }} />

      <RetiradaSection r={r} />
      <Divider sx={{ my: 3 }} />

      <PagamentosSection pagamentos={r.pagamentos} />
      <Divider sx={{ my: 3 }} />

      <ProdutosSection categorias={r.categorias} />

    </Box>
  );
}

/* ---------------- KPI ---------------- */


function Kpi({ title, value }) {
  return (
    <Grid item xs={6} md={3}>
      <Card>
        <CardContent>
          <Typography variant="body2">{title}</Typography>
          <Typography variant="h6">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}


function TotaisSection({ r }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>📊 Totais</Typography>
      <Grid container spacing={2}>
        <Kpi title="Total" value={`R$ ${r.total.toFixed(2)}`} />
        <Kpi title="Sem Taxa" value={`R$ ${r.totalSemTaxa.toFixed(2)}`} />
        <Kpi title="Pedidos" value={r.pedidosQtd} />
        <Kpi title="Ticket Médio" value={`R$ ${r.ticketMedio.toFixed(2)}`} />
      </Grid>
    </>
  );
}

function MotoboySection({ r }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>🛵 Entregas</Typography>
      <Grid container spacing={2}>
        <Kpi title="Pedidos Entrega" value={r.qtdPedidosEntrega} />
        <Kpi title="Valor Entregas" value={`R$ ${r.entrega.toFixed(2)}`} />
        <Kpi title="Taxa Entrega" value={`R$ ${r.taxaEntrega.toFixed(2)}`} />
      </Grid>
    </>
  );
}

function RetiradaSection({ r }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>🏪 Retirada</Typography>
      <Grid container spacing={2}>
        <Kpi title="Pedidos Retirada" value={r.qtdPedidosRetirada} />
        <Kpi title="Valor Retirada" value={`R$ ${r.retirada.toFixed(2)}`} />
      </Grid>
    </>
  );
}

function PagamentosSection({ pagamentos }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>💳 Pagamentos</Typography>
      <Grid container spacing={2}>
        {Object.entries(pagamentos).map(([k, v]) => (
          <Kpi key={k} title={k} value={`R$ ${v.toFixed(2)}`} />
        ))}
      </Grid>
    </>
  );
}

function ProdutosSection({ categorias }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>📦 Produtos</Typography>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)"
          },
          gap: 2
        }}
      >
        {Object.entries(categorias).map(([cat, produtos]) => {
          const lista = Object.entries(produtos)
            .map(([nome, d]) => ({ nome, ...d }))
            .sort((a, b) => b.qtd - a.qtd);

          return (
            <Card key={cat}>
              <CardContent>
                <Typography variant="h6">{cat}</Typography>

                {lista.map((p, i) => (
                  <Box key={p.nome + i} display="flex" justifyContent="space-between">
                    <Typography>
                      {i + 1}. {p.nome} ({p.qtd})
                    </Typography>
                    <Typography>
                      R$ {p.total.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
}