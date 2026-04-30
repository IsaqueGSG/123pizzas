import React, { useMemo, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Divider, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Checkbox,
  FormControlLabel, TextField, Stack, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip
} from "@mui/material";
import {
  TrendingUp, DeliveryDining, Storefront, Payments,
  Inventory, EventNote, FilterList
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
   LÓGICA DE NEGÓCIO (MEMOIZED)
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

      stats.totalGeral += totalPedido;
      stats.totalProdutos += valorProdutos;
      stats.totalTaxas += p.retirarNaLoja ? 0 : taxa;

      // Agrupamento Tipo
      if (p.retirarNaLoja) {
        stats.retirada.qtd++;
        stats.retirada.valor += totalPedido;
      } else {
        stats.entrega.qtd++;
        stats.entrega.valor += valorProdutos;

        // Motoboys
        const mb = p.motoboy || "Não atribuído";
        if (!stats.motoboys[mb]) stats.motoboys[mb] = { pedidos: 0, taxas: 0 };
        stats.motoboys[mb].pedidos++;
        stats.motoboys[mb].taxas += taxa;
      }

      // Agrupamento Pagamento
      const forma = getPagamento(p);
      stats.pagamentos[forma] = (stats.pagamentos[forma] || 0) + totalPedido;

      // Agrupamento Itens
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

      // 1. Agrupamento por Bairro
      const bairro = p.cliente?.endereco?.bairro || "Não informado";
      if (!stats.bairros[bairro]) stats.bairros[bairro] = { qtd: 0, total: 0 };
      stats.bairros[bairro].qtd++;
      stats.bairros[bairro].total += totalPedido;

      // 2. Média de Distância
      stats.distanciaTotal += Number(p.cliente?.endereco?.distanciaKm || 0);

      // 3. Análise de Horário
      const hora = toDate(p.createdAt).getHours();
      stats.horarios[hora] = (stats.horarios[hora] || 0) + 1;
    });

    return stats;
  }, [pedidos, filtros]);
};

/* =========================================================
   COMPONENTES DE UI
========================================================= */

/* =========================================================
   NOVA SEÇÃO: LOGÍSTICA E HORÁRIOS
========================================================= */

function LogisticaSection({ r }) {
  // Cálculo de média de distância
  const mediaDistancia = r.entrega.qtd > 0 ? (r.distanciaTotal / r.entrega.qtd).toFixed(2) : 0;

  return (
    <Grid container spacing={3}>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, bgcolor: 'primary.dark', color: 'white', height: '80%' }}>
          <Typography variant="subtitle2" gutterBottom>LOGÍSTICA ATIVA</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Distância Média</Typography>
              <Typography variant="h6">{mediaDistancia} km</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Taxa Média</Typography>
              <Typography variant="h6">{money(r.totalTaxas / (r.entrega.qtd || 1))}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>

        {/* Análise de Bairros com Barra de Relevância */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📍 Bairros Populares
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableBody>
                {Object.entries(r.bairros)
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 5) // Mostra os 5 principais
                  .map(([nome, dados]) => {
                    const percentual = (dados.total / r.totalGeral) * 100;
                    return (
                      <TableRow key={nome}>
                        <TableCell sx={{ borderBottom: 'none', py: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{nome}</Typography>
                          <Box sx={{ width: '100%', height: 4, bgcolor: '#eee', mt: 0.5, borderRadius: 2 }}>
                            <Box sx={{ width: `${percentual}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 2 }} />
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant="caption" color="text.secondary">{dados.qtd} ped.</Typography>
                          <Typography variant="body2" fontWeight="bold">{money(dados.total)}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>

        {/* Gráfico Simples de Horários */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>🕒 Picos de Horário</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 100, mt: 2 }}>
            {Array.from({ length: 24 }).map((_, h) => {
              const qtd = r.horarios[h] || 0;
              const max = Math.max(...Object.values(r.horarios), 1);
              const altura = (qtd / max) * 100;
              return (
                <Tooltip key={h} title={`${h}h: ${qtd} pedidos`}>
                  <Box sx={{
                    flex: 1,
                    bgcolor: qtd > 0 ? 'secondary.main' : '#f0f0f0',
                    height: `${altura}%`,
                    borderRadius: '2px 2px 0 0',
                    minWidth: '4px'
                  }} />
                </Tooltip>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">00h</Typography>
            <Typography variant="caption">12h</Typography>
            <Typography variant="caption">23h</Typography>
          </Box>
        </Paper>
      </Grid>

    </Grid>
  );
}
const StatCard = ({ title, value, icon: Icon, color = "primary.main" }) => (
  <Card sx={{ height: '100%', borderLeft: `4px solid`, borderColor: color }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
        </Box>
        {Icon && <Icon sx={{ color, opacity: 0.5, fontSize: 40 }} />}
      </Stack>
    </CardContent>
  </Card>
);

export default function RelatoriosPage() {
  const { pedidos, loading } = usePedidosRealtime();
  const [filtros, setFiltros] = useState({
    inicio: new Date().toISOString().slice(0, 10) + "T00:00",
    fim: new Date().toISOString().slice(0, 16),
    tipo: "todos",
    pagamento: "todos",
    incluirCancelados: false,
  });

  const r = useRelatorioData(pedidos, filtros);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* HEADER & FILTROS */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
          <EventNote color="primary" />
          <Typography variant="h5" fontWeight="bold">Dashboard de Vendas</Typography>
        </Stack>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Início"
              type="datetime-local"
              value={filtros.inicio}
              onChange={(e) => setFiltros({ ...filtros, inicio: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Fim"
              type="datetime-local"
              value={filtros.fim}
              onChange={(e) => setFiltros({ ...filtros, fim: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filtros.tipo}
                label="Tipo"
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="entrega">Entrega</MenuItem>
                <MenuItem value="retirada">Retirada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={<Checkbox checked={filtros.incluirCancelados}
                  onChange={(e) => setFiltros({ ...filtros, incluirCancelados: e.target.checked })} />}
                label="Ver Cancelados"
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* KPI SECTION */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Faturamento Total" value={money(r.totalGeral)} icon={TrendingUp} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total em Taxas" value={money(r.totalTaxas)} icon={DeliveryDining} color="#0288d1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Qtd Pedidos" value={r.qtdPedidos} icon={FilterList} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ticket Médio" value={money(r.totalGeral / (r.qtdPedidos || 1))} icon={Payments} color="#9c27b0" />
        </Grid>
      </Grid>

      <Grid item xs={12} md={8} mb={4}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <Inventory fontSize="small" /> Top Produtos por Categoria
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
            {Object.entries(r.categorias).map(([categoria, itens]) => (
              <Grid item xs={12} lg={6} key={categoria}> {/* Dois blocos por linha em telas grandes */}
                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {categoria.toUpperCase()}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {itens.sort((a, b) => b.qtd - a.qtd).map((item) => (
                          <TableRow key={item.nome} hover>
                            <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>{item.nome}</TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid #f0f0f0' }}>{item.qtd}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: '1px solid #f0f0f0' }}>{money(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      <Grid container spacing={3}>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <Payments fontSize="small" /> Formas de Pagamento
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {Object.entries(r.pagamentos).map(([nome, valor]) => (
              <Box key={nome} display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{nome}</Typography>
                <Typography variant="body2" fontWeight="bold">{money(valor)}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <DeliveryDining fontSize="small" /> Desempenho Motoboys
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {Object.entries(r.motoboys).map(([nome, dados]) => (
              <Box key={nome} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{nome}</Typography>
                <Chip size="small" label={`${dados.pedidos} envios`} color="info" variant="outlined" />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <LogisticaSection r={r} />
        </Grid>

      </Grid >
    </Box >
  );
}