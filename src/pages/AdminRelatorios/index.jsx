import React, { useMemo, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";

import {
  TrendingUp,
  ShoppingBag,
  Payments,
  DeliveryDining,
  Storefront,
  Refresh,
  Download,
  CalendarMonth,
  ReceiptLong,
  AccessTime,
  LocationOn,
  TwoWheeler,
  Inventory2,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";

/* =========================================================
   HELPERS
========================================================= */

function converterData(timestamp) {
  if (!timestamp) return null;

  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const data = new Date(timestamp);

    if (!Number.isNaN(data.getTime())) {
      return data;
    }
  }

  return null;
}

function dinheiro(valor = 0) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numero(valor = 0, casas = 0) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function porcentagem(valor = 0) {
  return `${Number(valor || 0).toFixed(1).replace(".", ",")}%`;
}

function obterPagamento(pedido) {
  return (
    pedido?.cliente?.formaPagamento?.forma ||
    pedido?.formaPagamento ||
    "Não informado"
  );
}

function normalizarPagamento(pedido) {
  return obterPagamento(pedido).toLowerCase();
}

function inicioDoDia(data = new Date()) {
  const d = new Date(data);

  d.setHours(0, 0, 0, 0);

  return d;
}

function fimDoDia(data = new Date()) {
  const d = new Date(data);

  d.setHours(23, 59, 59, 999);

  return d;
}

function formatarData(data) {
  if (!data) return "-";

  return data.toLocaleDateString("pt-BR");
}

function formatarDataCurta(data) {
  if (!data) return "-";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarHora(data) {
  if (!data) return "-";

  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   CORES / STATUS
========================================================= */

const STATUS_LABELS = {
  pendente: "Pendente",
  preparando: "Preparando",
  pronto: "Pronto",
  despachando: "Despachando",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_COLORS = {
  pendente: "warning",
  preparando: "info",
  pronto: "success",
  despachando: "secondary",
  entregue: "success",
  cancelado: "error",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mt: 0.8,
                letterSpacing: "-0.5px",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}

            {trend !== undefined && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ mt: 1 }}
              >
                {trend >= 0 ? (
                  <ArrowUpward
                    sx={{
                      fontSize: 15,
                      color: "success.main",
                    }}
                  />
                ) : (
                  <ArrowDownward
                    sx={{
                      fontSize: 15,
                      color: "error.main",
                    }}
                  />
                )}

                <Typography
                  variant="caption"
                  fontWeight={700}
                  color={trend >= 0 ? "success.main" : "error.main"}
                >
                  {Math.abs(trend).toFixed(1)}%
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  vs. período anterior
                </Typography>
              </Stack>
            )}
          </Box>

          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <Icon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   BARRA DE PAGAMENTO
========================================================= */

function PaymentBar({ label, value, total, icon }) {
  const percentual = total > 0 ? (value / total) * 100 : 0;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.8 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}

          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
        </Stack>

        <Typography variant="body2" fontWeight={700}>
          {dinheiro(value)}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(percentual, 100)}
        sx={{
          height: 8,
          borderRadius: 5,
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: "block" }}
      >
        {porcentagem(percentual)} do faturamento
      </Typography>
    </Box>
  );
}

/* =========================================================
   GRÁFICO SIMPLES
========================================================= */

function SalesChart({ dados }) {
  const maior = Math.max(...dados.map((item) => item.valor), 1);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box
        sx={{
          minWidth: Math.max(dados.length * 65, 500),
          height: 280,
          display: "flex",
          alignItems: "flex-end",
          gap: 1.5,
          px: 1,
          pb: 3,
        }}
      >
        {dados.map((item) => {
          const altura = (item.valor / maior) * 210;

          return (
            <Tooltip
              key={item.label}
              title={`${item.label}: ${dinheiro(item.valor)} • ${item.pedidos
                } pedidos`}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 35,
                  maxWidth: 80,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: `${Math.max(altura, 4)}px`,
                    borderRadius: "6px 6px 2px 2px",
                    bgcolor: "primary.main",
                    transition: "0.2s",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}

/* =========================================================
   HORÁRIOS
========================================================= */

function HoursChart({ dados }) {
  const maior = Math.max(...dados.map((item) => item.pedidos), 1);

  return (
    <Stack spacing={1.2}>
      {dados.map((item) => {
        const percentual = (item.pedidos / maior) * 100;

        return (
          <Box key={item.hora}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Typography
                variant="caption"
                sx={{
                  width: 42,
                  fontWeight: 600,
                }}
              >
                {item.hora}h
              </Typography>

              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentual}
                  sx={{
                    height: 9,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ width: 35, textAlign: "right" }}
              >
                {item.pedidos}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function RelatoriosPage() {
  const { pedidos = [], loading } = usePedidosRealtime();

  const hoje = new Date();

  const [periodo, setPeriodo] = useState("7dias");

  const [filtros, setFiltros] = useState({
    inicio: inicioDoDia(
      new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6)
    ),
    fim: fimDoDia(hoje),
    horaInicio: "00:00",
    horaFim: "23:59",
    tipo: "todos",
    pagamento: "todos",
    status: "todos",
  });

  /* =======================================================
     APLICA FILTROS
  ======================================================= */

  const pedidosFiltrados = useMemo(() => {
    return (pedidos || []).filter((pedido) => {
      const data = converterData(pedido.createdAt);

      if (!data) return false;

      if (filtros.inicio) {
        const inicio = new Date(filtros.inicio);

        const [hora, minuto] = filtros.horaInicio
          .split(":")
          .map(Number);

        inicio.setHours(hora, minuto, 0, 0);

        if (data < inicio) {
          return false;
        }
      }

      if (filtros.fim) {
        const fim = new Date(filtros.fim);

        const [hora, minuto] = filtros.horaFim
          .split(":")
          .map(Number);

        fim.setHours(hora, minuto, 59, 999);

        if (data > fim) {
          return false;
        }
      }

      if (
        filtros.tipo === "entrega" &&
        pedido.retirarNaLoja
      ) {
        return false;
      }

      if (
        filtros.tipo === "retirada" &&
        !pedido.retirarNaLoja
      ) {
        return false;
      }

      if (
        filtros.pagamento !== "todos" &&
        !normalizarPagamento(pedido).includes(
          filtros.pagamento.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        filtros.status !== "todos" &&
        pedido.status !== filtros.status
      ) {
        return false;
      }

      return true;
    });
  }, [pedidos, filtros]);

  /* =======================================================
     MÉTRICAS
  ======================================================= */

  const relatorio = useMemo(() => {
    const resultado = {
      faturamento: 0,
      faturamentoProdutos: 0,
      taxasEntrega: 0,
      pedidos: pedidosFiltrados.length,

      entregas: 0,
      retiradas: 0,

      valorEntregas: 0,
      valorRetiradas: 0,

      distanciaTotal: 0,

      pagamentos: {},
      produtos: {},
      categorias: {},
      motoboys: {},
      bairros: {},
      horarios: {},
      dias: {},

      status: {},
    };

    pedidosFiltrados.forEach((pedido) => {
      const total = Number(pedido.total || 0);

      const taxaEntrega = Number(
        pedido?.cliente?.endereco?.taxaEntrega || 0
      );

      const valorProdutos = pedido.retirarNaLoja
        ? total
        : total - taxaEntrega;

      resultado.faturamento += total;
      resultado.faturamentoProdutos += valorProdutos;

      if (!pedido.retirarNaLoja) {
        resultado.taxasEntrega += taxaEntrega;
        resultado.entregas++;
        resultado.valorEntregas += total;

        const distancia = Number(
          pedido?.cliente?.endereco?.distanciaKm || 0
        );

        resultado.distanciaTotal += distancia;
      } else {
        resultado.retiradas++;
        resultado.valorRetiradas += total;
      }

      /* PAGAMENTOS */

      const pagamento = obterPagamento(pedido);

      if (!resultado.pagamentos[pagamento]) {
        resultado.pagamentos[pagamento] = 0;
      }

      resultado.pagamentos[pagamento] += total;

      /* STATUS */

      const status = pedido.status || "não informado";

      if (!resultado.status[status]) {
        resultado.status[status] = 0;
      }

      resultado.status[status]++;

      /* HORÁRIO */

      const data = converterData(pedido.createdAt);

      if (data) {
        const hora = data.getHours();

        if (!resultado.horarios[hora]) {
          resultado.horarios[hora] = 0;
        }

        resultado.horarios[hora]++;

        /* DIA */

        const chaveDia = data.toISOString().slice(0, 10);

        if (!resultado.dias[chaveDia]) {
          resultado.dias[chaveDia] = {
            valor: 0,
            pedidos: 0,
          };
        }

        resultado.dias[chaveDia].valor += total;
        resultado.dias[chaveDia].pedidos++;
      }

      /* BAIRROS */

      const bairro =
        pedido?.cliente?.endereco?.bairro ||
        "Não informado";

      if (!resultado.bairros[bairro]) {
        resultado.bairros[bairro] = {
          pedidos: 0,
          valor: 0,
        };
      }

      resultado.bairros[bairro].pedidos++;
      resultado.bairros[bairro].valor += total;

      /* MOTOBOY */

      if (!pedido.retirarNaLoja) {
        const motoboy =
          pedido.motoboy || "Não atribuído";

        if (!resultado.motoboys[motoboy]) {
          resultado.motoboys[motoboy] = {
            pedidos: 0,
            valor: 0,
            taxas: 0,
          };
        }

        resultado.motoboys[motoboy].pedidos++;
        resultado.motoboys[motoboy].valor += valorProdutos;
        resultado.motoboys[motoboy].taxas += taxaEntrega;
      }

      /* PRODUTOS */

      (pedido.itens || []).forEach((item) => {
        const nome =
          item?.nome || "Produto sem nome";

        const categoria =
          item?.categoriaNome || "Outros";

        const quantidade = Number(
          item?.quantidade || 0
        );

        const valor = Number(
          item?.valor || 0
        );

        if (!resultado.produtos[nome]) {
          resultado.produtos[nome] = {
            nome,
            categoria,
            quantidade: 0,
            faturamento: 0,
          };
        }

        resultado.produtos[nome].quantidade += quantidade;

        resultado.produtos[nome].faturamento +=
          valor * quantidade;

        if (!resultado.categorias[categoria]) {
          resultado.categorias[categoria] = {
            quantidade: 0,
            faturamento: 0,
          };
        }

        resultado.categorias[categoria].quantidade +=
          quantidade;

        resultado.categorias[categoria].faturamento +=
          valor * quantidade;
      });
    });

    const ticketMedio =
      resultado.pedidos > 0
        ? resultado.faturamento / resultado.pedidos
        : 0;

    const distanciaMedia =
      resultado.entregas > 0
        ? resultado.distanciaTotal /
        resultado.entregas
        : 0;

    const dias = Object.entries(resultado.dias)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, dados]) => ({
        label: formatarDataCurta(
          new Date(`${data}T12:00:00`)
        ),
        valor: dados.valor,
        pedidos: dados.pedidos,
      }));

    const horarios = Object.entries(
      resultado.horarios
    )
      .map(([hora, pedidos]) => ({
        hora: Number(hora),
        pedidos,
      }))
      .sort((a, b) => a.hora - b.hora);

    const produtos = Object.values(
      resultado.produtos
    )
      .sort(
        (a, b) =>
          b.quantidade - a.quantidade
      )
      .slice(0, 10);

    const bairros = Object.entries(
      resultado.bairros
    )
      .map(([nome, dados]) => ({
        nome,
        ...dados,
      }))
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 8);

    const motoboys = Object.entries(
      resultado.motoboys
    )
      .map(([nome, dados]) => ({
        nome,
        ...dados,
      }))
      .sort((a, b) => b.pedidos - a.pedidos);

    return {
      ...resultado,
      ticketMedio,
      distanciaMedia,
      dias,
      horarios,
      produtos,
      bairros,
      motoboys,
    };
  }, [pedidosFiltrados]);

  /* =======================================================
     PEDIDOS RECENTES
  ======================================================= */

  const pedidosRecentes = useMemo(() => {
    return [...pedidosFiltrados]
      .sort((a, b) => {
        const dataA = converterData(a.createdAt);
        const dataB = converterData(b.createdAt);

        return (
          (dataB?.getTime() || 0) -
          (dataA?.getTime() || 0)
        );
      })
      .slice(0, 8);
  }, [pedidosFiltrados]);

  /* =======================================================
     APLICAR PERÍODO RÁPIDO
  ======================================================= */

  function alterarPeriodo(valor) {
    const agora = new Date();

    let inicio = new Date(agora);

    if (valor === "hoje") {
      inicio = inicioDoDia(agora);
    }

    if (valor === "7dias") {
      inicio = inicioDoDia(
        new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate() - 6
        )
      );
    }

    if (valor === "30dias") {
      inicio = inicioDoDia(
        new Date(
          agora.getFullYear(),
          agora.getMonth(),
          agora.getDate() - 29
        )
      );
    }

    setPeriodo(valor);

    setFiltros((old) => ({
      ...old,
      inicio,
      fim: fimDoDia(agora),
      horaInicio: "00:00",
      horaFim: "23:59",
    }));
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">
            Carregando relatórios...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        bgcolor: "#f7f8fa",
        minHeight: "100vh",
        p: {
          xs: 2,
          md: 3,
          lg: 4,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              letterSpacing: "-1px",
            }}
          >
            Relatórios
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Acompanhe o desempenho das suas vendas
            e operações.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Atualizar">
            <IconButton
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          >
            Exportar
          </Button>
        </Stack>
      </Stack>

      {/* =================================================
          FILTROS
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Button
            variant={
              periodo === "hoje"
                ? "contained"
                : "outlined"
            }
            onClick={() =>
              alterarPeriodo("hoje")
            }
          >
            Hoje
          </Button>

          <Button
            variant={
              periodo === "7dias"
                ? "contained"
                : "outlined"
            }
            onClick={() =>
              alterarPeriodo("7dias")
            }
          >
            7 dias
          </Button>

          <Button
            variant={
              periodo === "30dias"
                ? "contained"
                : "outlined"
            }
            onClick={() =>
              alterarPeriodo("30dias")
            }
          >
            30 dias
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Data inicial"
              type="date"
              value={
                filtros.inicio
                  ? filtros.inicio
                    .toISOString()
                    .slice(0, 10)
                  : ""
              }
              onChange={(e) => {
                const data = new Date(
                  `${e.target.value}T00:00:00`
                );

                setPeriodo("personalizado");

                setFiltros((old) => ({
                  ...old,
                  inicio: data,
                }));
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Data final"
              type="date"
              value={
                filtros.fim
                  ? filtros.fim
                    .toISOString()
                    .slice(0, 10)
                  : ""
              }
              onChange={(e) => {
                const data = new Date(
                  `${e.target.value}T23:59:59`
                );

                setPeriodo("personalizado");

                setFiltros((old) => ({
                  ...old,
                  fim: data,
                }));
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Horário inicial"
              type="time"
              value={filtros.horaInicio}
              onChange={(e) =>
                setFiltros((old) => ({
                  ...old,
                  horaInicio: e.target.value,
                }))
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Horário final"
              type="time"
              value={filtros.horaFim}
              onChange={(e) =>
                setFiltros((old) => ({
                  ...old,
                  horaFim: e.target.value,
                }))
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>
                Modalidade
              </InputLabel>

              <Select
                value={filtros.tipo}
                label="Modalidade"
                onChange={(e) =>
                  setFiltros((old) => ({
                    ...old,
                    tipo: e.target.value,
                  }))
                }
              >
                <MenuItem value="todos">
                  Todas
                </MenuItem>

                <MenuItem value="entrega">
                  Entregas
                </MenuItem>

                <MenuItem value="retirada">
                  Retiradas
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>
                Pagamento
              </InputLabel>

              <Select
                value={filtros.pagamento}
                label="Pagamento"
                onChange={(e) =>
                  setFiltros((old) => ({
                    ...old,
                    pagamento: e.target.value,
                  }))
                }
              >
                <MenuItem value="todos">
                  Todos
                </MenuItem>

                <MenuItem value="pix">
                  PIX
                </MenuItem>

                <MenuItem value="dinheiro">
                  Dinheiro
                </MenuItem>

                <MenuItem value="cartão">
                  Cartão
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>
                Status
              </InputLabel>

              <Select
                value={filtros.status}
                label="Status"
                onChange={(e) =>
                  setFiltros((old) => ({
                    ...old,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="todos">
                  Todos
                </MenuItem>

                {Object.entries(
                  STATUS_LABELS
                ).map(([value, label]) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* =================================================
          CARDS
      ================================================= */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Faturamento"
            value={dinheiro(
              relatorio.faturamento
            )}
            subtitle={`${relatorio.pedidos} pedidos no período`}
            icon={TrendingUp}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pedidos"
            value={numero(
              relatorio.pedidos
            )}
            subtitle={`Ticket médio ${dinheiro(
              relatorio.ticketMedio
            )}`}
            icon={ShoppingBag}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Taxas de entrega"
            value={dinheiro(
              relatorio.taxasEntrega
            )}
            subtitle={`${relatorio.entregas} entregas`}
            icon={DeliveryDining}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Produtos"
            value={dinheiro(
              relatorio.faturamentoProdutos
            )}
            subtitle="Valor sem taxas de entrega"
            icon={Inventory2}
            color="info"
          />
        </Grid>
      </Grid>

      {/* =================================================
          FATURAMENTO
      ================================================= */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 2.5,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Faturamento
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Evolução das vendas no período
                </Typography>
              </Box>

              <Chip
                icon={<CalendarMonth />}
                label={`${formatarData(
                  filtros.inicio
                )} - ${formatarData(
                  filtros.fim
                )}`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {relatorio.dias.length > 0 ? (
              <SalesChart
                dados={relatorio.dias}
              />
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Nenhum dado encontrado.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* PAGAMENTOS */}

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 2.5,
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Pagamentos
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Distribuição por forma de pagamento
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            {Object.entries(
              relatorio.pagamentos
            ).length === 0 ? (
              <Typography color="text.secondary">
                Nenhum pagamento encontrado.
              </Typography>
            ) : (
              Object.entries(
                relatorio.pagamentos
              )
                .sort(([, a], [, b]) => b - a)
                .map(([forma, valor]) => (
                  <PaymentBar
                    key={forma}
                    label={forma}
                    value={valor}
                    total={
                      relatorio.faturamento
                    }
                    icon={
                      <Payments
                        sx={{
                          fontSize: 18,
                          color:
                            "text.secondary",
                        }}
                      />
                    }
                  />
                ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* =================================================
          ENTREGA / RETIRADA
      ================================================= */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: "warning.light",
                  color: "warning.dark",
                }}
              >
                <DeliveryDining />
              </Avatar>

              <Box>
                <Typography fontWeight={800}>
                  Entregas
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Pedidos entregues
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {relatorio.entregas}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {dinheiro(
                relatorio.valorEntregas
              )} em pedidos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: "info.light",
                  color: "info.dark",
                }}
              >
                <Storefront />
              </Avatar>

              <Box>
                <Typography fontWeight={800}>
                  Retiradas
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Pedidos retirados na loja
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {relatorio.retiradas}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {dinheiro(
                relatorio.valorRetiradas
              )} em pedidos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: "success.light",
                  color: "success.dark",
                }}
              >
                <LocationOn />
              </Avatar>

              <Box>
                <Typography fontWeight={800}>
                  Distância
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Operação de entrega
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {numero(
                relatorio.distanciaTotal,
                1
              )}{" "}
              km
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Média de{" "}
              {numero(
                relatorio.distanciaMedia,
                1
              )}{" "}
              km por entrega
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* =================================================
          PRODUTOS / HORÁRIOS
      ================================================= */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* PRODUTOS */}

        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Produtos mais vendidos
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Produtos com maior quantidade vendida
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Produto
                    </TableCell>

                    <TableCell>
                      Categoria
                    </TableCell>

                    <TableCell align="right">
                      Quantidade
                    </TableCell>

                    <TableCell align="right">
                      Faturamento
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatorio.produtos.map((produto) => (
                    <TableRow
                      key={produto.nome}
                      hover
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {produto.nome}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={produto.categoria}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          {numero(produto.quantidade)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {dinheiro(produto.faturamento)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {relatorio.produtos.length > 0 && (
                    <TableRow
                      sx={{
                        "& td": {
                          borderTop: "2px solid",
                          borderColor: "divider",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <TableCell colSpan={2}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                        >
                          TOTAL
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={800}>
                          {numero(
                            relatorio.produtos.reduce(
                              (total, produto) =>
                                total + produto.quantidade,
                              0
                            )
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={800}>
                          {dinheiro(
                            relatorio.produtos.reduce(
                              (total, produto) =>
                                total + produto.faturamento,
                              0
                            )
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {relatorio.produtos.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                      >
                        <Typography
                          color="text.secondary"
                          sx={{ py: 3 }}
                        >
                          Nenhum produto encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* HORÁRIOS */}

        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <AccessTime color="primary" />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Horários de pico
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2.5 }}
            >
              Quantidade de pedidos por hora
            </Typography>

            <HoursChart
              dados={relatorio.horarios}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* =================================================
          MOTOBOYS / BAIRROS
      ================================================= */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* MOTOBOYS */}

        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <TwoWheeler color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Entregadores
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Desempenho por motoboy
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Entregador
                    </TableCell>

                    <TableCell align="right">
                      Pedidos
                    </TableCell>

                    <TableCell align="right">
                      Produtos
                    </TableCell>

                    <TableCell align="right">
                      Taxas
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatorio.motoboys.map(
                    (motoboy) => (
                      <TableRow
                        hover
                        key={motoboy.nome}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 13,
                              }}
                            >
                              {motoboy.nome
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {motoboy.nome}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          {motoboy.pedidos}
                        </TableCell>

                        <TableCell align="right">
                          {dinheiro(
                            motoboy.valor
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {dinheiro(
                            motoboy.taxas
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}

                  {relatorio.motoboys.length ===
                    0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                        >
                          <Typography
                            color="text.secondary"
                            sx={{ py: 3 }}
                          >
                            Nenhuma entrega encontrada.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* BAIRROS */}

        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <LocationOn color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Regiões
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Bairros com maior volume de pedidos
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Bairro
                    </TableCell>

                    <TableCell align="right">
                      Pedidos
                    </TableCell>

                    <TableCell align="right">
                      Faturamento
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatorio.bairros.map(
                    (bairro) => (
                      <TableRow
                        hover
                        key={bairro.nome}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {bairro.nome}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={
                              bairro.pedidos
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          {dinheiro(
                            bairro.valor
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}

                  {relatorio.bairros.length ===
                    0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                        >
                          <Typography
                            color="text.secondary"
                            sx={{ py: 3 }}
                          >
                            Nenhum bairro encontrado.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* =================================================
          PEDIDOS RECENTES
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Pedidos recentes
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Últimos pedidos do período selecionado
              </Typography>
            </Box>

            <Chip
              label={`${relatorio.pedidos} pedidos`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Pedido
                </TableCell>

                <TableCell>
                  Cliente
                </TableCell>

                <TableCell>
                  Data
                </TableCell>

                <TableCell>
                  Modalidade
                </TableCell>

                <TableCell>
                  Pagamento
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell align="right">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pedidosRecentes.map((pedido) => {
                const data = converterData(
                  pedido.createdAt
                );

                const status =
                  pedido.status ||
                  "não informado";

                return (
                  <TableRow
                    hover
                    key={pedido.id}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        #{pedido.id?.slice(-6)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {pedido?.cliente?.nome ||
                        "Cliente não informado"}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatarData(data)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatarHora(data)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {pedido.retirarNaLoja ? (
                        <Chip
                          size="small"
                          icon={
                            <Storefront />
                          }
                          label="Retirada"
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={
                            <DeliveryDining />
                          }
                          label="Entrega"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {obterPagamento(pedido)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          STATUS_COLORS[
                          status
                          ] || "default"
                        }
                        label={
                          STATUS_LABELS[
                          status
                          ] || status
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        fontWeight={700}
                      >
                        {dinheiro(
                          pedido.total
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}

              {pedidosRecentes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                    <Box sx={{ py: 5 }}>
                      <ReceiptLong
                        sx={{
                          fontSize: 45,
                          color:
                            "text.disabled",
                        }}
                      />

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Nenhum pedido encontrado
                        para os filtros selecionados.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

