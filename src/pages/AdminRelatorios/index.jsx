import React, { useMemo, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Divider, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Checkbox,
  FormControlLabel, TextField, Stack, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip,
  Avatar
} from "@mui/material";
import {
  TrendingUp, DeliveryDining, Storefront, Payments,
  Inventory, EventNote, FilterList, LocationOn, AccessTime,
  Moped, BarChart
} from "@mui/icons-material";

import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";

/* =========================================================
   UTILS
========================================================= */
const toDate = (ts) => (ts?.seconds ? new Date(ts.seconds * 1000) : new Date());

const money = (v = 0) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getPagamento = (p) => {
  const forma = p?.cliente?.formaPagamento?.forma || p?.formaPagamento || "Não informado";
  return forma.toLowerCase();
};

/* =========================================================
   LÓGICA DE NEGÓCIO
========================================================= */
const useRelatorioData = (pedidos, filtros) => {
  return useMemo(() => {
    const filtrados = (pedidos || []).filter((p) => {
      if (!filtros.incluirCancelados && p.status === "cancelado") return false;
      const data = toDate(p.createdAt);
      if (filtros.inicio && data < new Date(filtros.inicio)) return false;
      if (filtros.fim && data > new Date(filtros.fim)) return false;
      if (filtros.tipo === "entrega" && p.retirarNaLoja) return false;
      if (filtros.tipo === "retirada" && !p.retirarNaLoja) return false;
      if (filtros.pagamento !== "todos") {
        if (!getPagamento(p).includes(filtros.pagamento)) return false;
      }
      return true;
    });

    const stats = {
      totalGeral: 0,
      totalProdutos: 0,
      totalTaxas: 0,
      qtdPedidos: filtrados.length,
      entrega: { valor: 0, qtd: 0 },
      retirada: { valor: 0, qtd: 0 },
      pagamentos: {},
      categorias: {},
      motoboys: {},
      bairros: {},
      horarios: {},
      distanciaTotal: 0
    };

    filtrados.forEach((p) => {
      const taxa = Number(p?.cliente?.endereco?.taxaEntrega || 0);
      const totalPedido = Number(p.total || 0);
      const valorProdutos = totalPedido - (p.retirarNaLoja ? 0 : taxa);
      const horaPico = Object.entries(stats.horarios).sort((a, b) => b[1] - a[1])[0]?.[0];

      stats.totalGeral += totalPedido;
      stats.totalProdutos += valorProdutos;
      stats.totalTaxas += p.retirarNaLoja ? 0 : taxa;

      if (p.retirarNaLoja) {
        stats.retirada.qtd++;
        stats.retirada.valor += totalPedido;
      } else {
        stats.entrega.qtd++;
        stats.entrega.valor += valorProdutos;

        const mb = p.motoboy || "Não atribuído";
        if (!stats.motoboys[mb]) stats.motoboys[mb] = { pedidos: 0, total: 0 };
        stats.motoboys[mb].pedidos++;
        stats.motoboys[mb].total += totalPedido;
      }

      const forma = getPagamento(p);
      stats.pagamentos[forma] = (stats.pagamentos[forma] || 0) + totalPedido;

      (p.itens || []).forEach((item) => {
        const cat = item?.categoriaNome || "Outros";
        if (!stats.categorias[cat]) stats.categorias[cat] = [];
        const existe = stats.categorias[cat].find(i => i.nome === item.nome);
        if (existe) {
          existe.qtd += Number(item.quantidade || 0);
          existe.total += Number(item.valor || 0) * Number(item.quantidade || 0);
        } else {
          stats.categorias[cat].push({
            nome: item.nome || "Produto sem nome",
            qtd: Number(item.quantidade || 0),
            total: Number(item.valor || 0) * Number(item.quantidade || 0)
          });
        }
      });

      const bairro = p.cliente?.endereco?.bairro || "Não informado";
      if (!stats.bairros[bairro]) stats.bairros[bairro] = { qtd: 0, total: 0 };
      stats.bairros[bairro].qtd++;
      stats.bairros[bairro].total += totalPedido;

      stats.distanciaTotal += Number(p.cliente?.endereco?.distanciaKm || 0);
      const hora = toDate(p.createdAt).getHours();
      stats.horarios[hora] = (stats.horarios[hora] || 0) + 1;
    });

    return stats;
  }, [pedidos, filtros]);
};

/* =========================================================
   COMPONENTES
========================================================= */

const StatCard = ({ title, value, icon: Icon, color = "primary.main" }) => (
  <Card sx={{ height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 3 }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="800" sx={{ color: '#1a1a1a' }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function RelatoriosPage() {
  const { pedidos, loading } = usePedidosRealtime();
  const [buscaProduto, setBuscaProduto] = useState("");
  const [filtros, setFiltros] = useState({
    inicio: new Date().toISOString().slice(0, 10) + "T00:00",
    fim: new Date().toISOString().slice(0, 16),
    tipo: "todos",
    pagamento: "todos",
    incluirCancelados: false,
  });

  const r = useRelatorioData(pedidos, filtros);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  return (
    <Box p={4} sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER & FILTROS */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <BarChart color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="800">Relatório de Operações</Typography>
              <Typography variant="body2" color="text.secondary">Acompanhe métricas de vendas e logística</Typography>
            </Box>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="De" type="datetime-local" value={filtros.inicio}
              onChange={(e) => setFiltros({ ...filtros, inicio: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Até" type="datetime-local" value={filtros.fim}
              onChange={(e) => setFiltros({ ...filtros, fim: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Modalidade</InputLabel>
              <Select label="Modalidade" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
                <MenuItem value="todos">Todas as Vendas</MenuItem>
                <MenuItem value="entrega">Apenas Entregas</MenuItem>
                <MenuItem value="retirada">Apenas Retiradas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={<Checkbox checked={filtros.incluirCancelados}
                onChange={(e) => setFiltros({ ...filtros, incluirCancelados: e.target.checked })} />}
              label="Incluir Pedidos Cancelados"
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Faturamento Bruto" value={money(r.totalGeral)} icon={TrendingUp} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ticket Médio" value={money(r.totalGeral / (r.qtdPedidos || 1))} icon={Payments} color="#9c27b0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Taxa de Cancelamento" value={`${((pedidos.filter(p => p.status === 'cancelado').length / (pedidos.length || 1)) * 100).toFixed(1)}%`} icon={FilterList} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Distância Média" value={`${(r.distanciaTotal / (r.entrega.qtd || 1)).toFixed(1)} km`} icon={LocationOn} color="#0288d1" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* PRODUTOS COM BUSCA */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <Inventory color="action" /> Desempenho de Itens
              </Typography>
              <TextField
                size="small"
                placeholder="Buscar produto..."
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                sx={{ width: 250 }}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Box>
              <Grid container spacing={2}>
                {Object.entries(r.categorias).map(([categoria, itens]) => {
                  const itensFiltrados = itens.filter(i => i.nome.toLowerCase().includes(buscaProduto.toLowerCase()));
                  if (itensFiltrados.length === 0) return null;

                  return (
                    <Grid item xs={12} md={6} key={categoria}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #f0f0f0', bgcolor: '#fff', height: '300px', overflowY: 'auto' }}>
                        <Typography variant="caption" color="primary" fontWeight="bold">{categoria.toUpperCase()}</Typography>
                        {itensFiltrados.map((item) => (
                          <Box key={item.nome} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2">{item.nome}</Typography>
                            <Typography variant="body2" fontWeight="bold">{item.qtd}x</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* RANKING MOTOBOYS DETALHADO */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <Moped color="action" /> Ranking de Entregadores
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Eficiência baseada em volume e faturamento
              </Typography>
              <Divider />
              <Box sx={{ height: '300px', overflowY: 'auto' }}>
                <Stack spacing={2} mt={2}>

                  {Object.entries(r.motoboys).sort((a, b) => b[1].total - a[1].total).map(([nome, dados]) => (
                    <Box key={nome} sx={{
                      p: 2, borderRadius: 2, border: '1px solid #eee',
                      transition: '0.3s', '&:hover': { bgcolor: '#f1f8fe', borderColor: '#2196f3' }
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>{nome[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{nome}</Typography>
                            <Typography variant="caption" color="text.secondary">{dados.pedidos} entregas</Typography>
                          </Box>
                        </Stack>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight="bold" color="primary.dark">{money(dados.total)}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 10 }}>
                            Média: {money(dados.total / dados.pedidos)}/ped
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}

                </Stack>
              </Box>
            </Paper>

            {/* HEATMAP DE HORÁRIOS (SIMPLIFICADO) - removido pq ficou feio */} 
            {/* <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <AccessTime color="action" /> Picos de Demanda
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 60, mt: 2, height: '300px', overflowY: 'auto' }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const valor = r.horarios[i] || 0;
                  const max = Math.max(...Object.values(r.horarios), 1);
                  return (
                    <Tooltip title={`${i}h: ${valor} pedidos`} key={i}>
                      <Box sx={{
                        flex: 1,
                        height: `${(valor / max) * 100}%`,
                        bgcolor: valor === max ? 'error.main' : 'primary.light',
                        borderRadius: '2px 2px 0 0'
                      }} />
                    </Tooltip>
                  );
                })}
              </Box>
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="caption">00h</Typography>
                <Typography variant="caption">Pico: {Object.entries(r.horarios).sort((a, b) => b[1] - a[1])[0]?.[0]}h</Typography>
                <Typography variant="caption">23h</Typography>
              </Stack>
            </Paper> */}

          </Stack>

        </Grid>

      </Grid>

    </Box >
  );
}