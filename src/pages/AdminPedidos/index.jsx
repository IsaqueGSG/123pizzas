import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  IconButton,
  Button,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Paper,
  TextField,
  Tooltip
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { deletarPedidos, atualizarPedido } from "../../services/pedidos.service";
import { imprimir, geraComandaHTML } from "../../services/impressora.service";
import { enviarMensagemWhatsApp, gerarMensagemConfirmacao, abrirConversaWhatsApp } from "../../services/whatsapp.service";

import { useLoja } from "../../contexts/LojaContext";
import { usePreferencias } from "../../contexts/PreferenciasContext";
import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";

import AdminDrawer from "../../components/AdminDrawer";
import ConfirmDialog from "../../components/ConfirmDialog";
import MotoboyModal from "./components/modalMotoboys";

export default function AdminPedidos() {
  const { idLoja } = useLoja()
  const { preferencias, abertoAgora } = usePreferencias();
  const { pedidos, loading, autoAceitarPedidos, toggleAutoAceitar } = usePedidosRealtime();

  const statusTabs = ["pendente", "preparando", "despachando", "finalizado", "cancelado"];
  const [abaAtiva, setAbaAtiva] = useState(0);

  const [dataFiltro, setDataFiltro] = useState(
    new Date().toLocaleDateString("sv-SE")
  );

  const skip = sessionStorage.getItem("dontAskAgain") === "true";
  const ultimoMotoboy = sessionStorage.getItem("ultimoMotoboy");
  const [openModalMotoboys, setOpenModalMotoboys] = useState(false);
  const [pedidoParaDespachar, setPedidoParaDespachar] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const pedidosPorData = useMemo(() => {

    if (!dataFiltro) return pedidos;

    // 🔥 cria data LOCAL corretamente
    const [ano, mes, dia] = dataFiltro.split("-").map(Number);
    const inicio = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
    const fim = new Date(ano, mes - 1, dia, 23, 59, 59, 999);

    return pedidos.filter(p => {
      if (!p.createdAt?.seconds) return false;

      const d = new Date(p.createdAt.seconds * 1000);

      return d >= inicio && d <= fim;
    });

  }, [pedidos, dataFiltro]);

  const pedidosFiltrados = useMemo(() => {

    return pedidosPorData
      .filter(p => p.status === statusTabs[abaAtiva])
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

  }, [pedidosPorData, abaAtiva]);

  const contadoresStatus = useMemo(() => {
    const contadores = {
      pendente: 0,
      preparando: 0,
      despachando: 0,
      finalizado: 0,
      cancelado: 0
    };

    pedidosPorData.forEach(p => {
      if (contadores[p.status] !== undefined) {
        contadores[p.status]++;
      }
    });

    return contadores;
  }, [pedidosPorData]);

  const pedidosOrdenados = useMemo(() => {
    return [...pedidosPorData]
      .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
  }, [pedidosPorData]);

  function getNumeroComanda(pedido) {
    return pedidosOrdenados.findIndex(p => p.id === pedido.id) + 1;
  }

  async function imprimirPedidoSeguro(pedido) {
    const largura = preferencias?.impressao?.largura || "80mm";
    const numComanda = getNumeroComanda(pedido);

    try {
      // navegador normal
      if (!window.electronAPI) {
        const html = geraComandaHTML(pedido, largura, numComanda);
        imprimir(html);
        return true;
      }

      const impressora = await window.electronAPI.getPrinter();

      if (!impressora) {
        alert("⚠️ Nenhuma impressora configurada.");
        return false;
      }

      const result = await window.electronAPI.imprimirPedido(
        pedido,
        largura,
        numComanda
      );

      if (!result?.success) {
        alert(
          "❌ Falha ao imprimir.\n\n" +
          (result?.error || "Erro desconhecido.")
        );
        return false;
      }

      return true;

    } catch (error) {
      alert(
        "❌ Erro ao imprimir.\n\n" +
        (error.message || error)
      );
      return false;
    }
  }

  const handlePreparar = async (pedido) => {
    if (pedido.impresso) return;
    try {
      await atualizarPedido(idLoja, pedido.id, { status: "preparando" });

      const imprimiu = imprimirPedidoSeguro(pedido); // Tenta imprimir a comanda

      const texto = gerarMensagemConfirmacao(pedido);

      await enviarMensagemWhatsApp( // Envia a mensagem de confirmação
        idLoja,
        pedido.cliente.telefone,
        texto
      );

      if (!imprimiu) { // Se não conseguiu imprimir, não marca como impresso
        alert("⚠️ falha na impressão.");
        return;
      }

      await atualizarPedido(idLoja, pedido.id, {
        impresso: true
      });

    } catch (error) {
      console.error("Erro ao iniciar preparo:", error);
      alert("Erro ao iniciar preparo");
    }
  };

  const handleDespachando = async (pedido, motoboy) => {
    try {
      await atualizarPedido(idLoja, pedido.id, {
        status: "despachando",
        motoboy: motoboy || null
      });

      const texto = `Olá ${pedido.cliente.nome}, seu pedido está pronto e ${pedido.retirarNaLoja
        ? "você pode retirá-lo"
        : "está a caminho"
        }!`;

      await enviarMensagemWhatsApp(
        idLoja,
        pedido.cliente.telefone,
        texto
      );

    } catch (error) {
      console.error("Erro ao despachar pedido:", error);
      alert("Erro ao despachar pedido");
    }
  };

  const handleFinalizar = async (pedido) => {

    try {
      await atualizarPedido(idLoja, pedido.id, { status: "finalizado" });

    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro ao finalizar pedido");
    }
  };

  const handleExcluir = async () => {
    if (!pedidoSelecionado) return;

    const podeExcluir = !["pendente", "preparando"].includes(pedidoSelecionado.status);

    if (!podeExcluir) {
      alert("Pedidos pendentes ou em preparo não podem ser excluídos.");
      return;
    }

    try {
      await deletarPedidos(idLoja, [pedidoSelecionado.id]);
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      alert("Erro ao excluir pedido");
    }
  };

  function obterCategoriaItem(item) {

    if (item.categoriaNome?.trim()) {
      return item.categoriaNome.trim();
    }

    if (item.categoria?.nome?.trim()) {
      return item.categoria.nome.trim();
    }

    if (item.sabores?.length) {
      const nome = item.sabores[0]?.categoria?.nome;
      if (nome?.trim()) return nome.trim();
    }

    if (item.tipo?.trim()) return item.tipo.trim();

    return "Itens";
  }

  const aberto = !loading && abertoAgora

  const pedidosAnterioresRef = useRef([]);

  useEffect(() => {
    if (!pedidos?.length) return;

    const pedidosNovos = pedidos.filter(
      pedidoAtual =>
        !pedidosAnterioresRef.current.some(
          pedidoAnterior => pedidoAnterior.id === pedidoAtual.id
        )
    );

    pedidosNovos.forEach(pedido => {
      console.log("🆕 NOVO PEDIDO RECEBIDO:", pedido);
    });

    pedidosAnterioresRef.current = pedidos;
  }, [pedidos]);

  return (
    <Box sx={{ p: 2 }}>

      <AdminDrawer />

      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>

        {/* Filtro de Data - Reduzido */}
        <TextField
          type="date"
          size="small"
          InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
          inputProps={{ style: { fontSize: '0.8rem', padding: '8px' } }}
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          sx={{ width: 130 }}
        />

        <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

        {/* Switch - Adicionado size="small" */}
        <FormControlLabel
          sx={{ ml: 0, mr: 0 }}
          control={<Switch size="small" checked={autoAceitarPedidos} onChange={toggleAutoAceitar} />}
          label={<Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Auto Aceitar</Typography>}
        />

        <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

        {/* Status - Indicador Visual */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: aberto ? 'success.main' : 'error.main' }} />
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.75rem' }}
          >
            Loja {aberto ? "Aberta" : "Fechada"}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Botão de Ação - Reduzido para ícone ou tamanho small */}
        <Tooltip title="Abrir Loja">
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: '1rem' }} />}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
            onClick={() => {
              const url = `${window.location.origin}/${idLoja}`;

              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Loja
          </Button>
        </Tooltip>
      </Paper>

      <Divider sx={{ mt: 2 }} />

      <Tabs
        value={abaAtiva}
        onChange={(e, newValue) => setAbaAtiva(newValue)}
        variant="fullWidth"
        sx={{
          mb: 3,
          px: 0,
          mx: -2, // Puxa para as bordas da tela se o Box pai tiver padding de 2
          width: "calc(100% + 32px)", // Compensa a margem negativa para ocupar exatamente a largura total
          "& .MuiTab-root": {
            minWidth: 0,
            px: 1, // Reduz o padding lateral interno de cada aba
          }
        }}
      >
        {statusTabs.map((status) => (
          <Tab
            key={status}
            label={`${status.toUpperCase()} (${contadoresStatus[status]})`}
          />
        ))}
      </Tabs>

      {
        loading ? (
          <Typography sx={{ p: 3 }}>Carregando pedidos...</Typography>
        ) : (
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
            {pedidosFiltrados.map((pedido) => (

              <Card
                key={pedido.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column"
                }}
              >

                {/* CABEÇALHO DO CARD */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                  <Box sx={{ width: "100%" }}>

                    {/* Nome do Cliente e Data */}
                    <Box sx={{ mr: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                        {pedido.cliente?.nome || "#"}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                        {new Date(pedido.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>

                    {/* Endereço/Localização */}
                    {pedido.retirarNaLoja && (
                      <Typography variant="body2" color="text.secondary">
                        📍 Retirar na Loja
                      </Typography>
                    )}

                    {!pedido.retirarNaLoja && pedido.cliente.endereco.placeId !== "" && (
                      <Typography variant="body2" color="text.secondary">
                        📍 {pedido.cliente.endereco.rua || "Rua não informada"},{" "}
                        {pedido.cliente.endereco.numero || "S/N"}
                        {pedido.cliente.endereco.bairro &&
                          ` - ${pedido.cliente.endereco.bairro}`}
                      </Typography>
                    )}
                  </Box>

                  {/* Ações Rápidas */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={async () => {
                        console.log("Imprimindo pedido", pedido);
                        const larguraImpressao = preferencias?.impressao?.largura || "80mm";
                        const numComanda = getNumeroComanda(pedido);
                        if (!window.electronAPI) {
                          console.log(pedido)
                          const html = geraComandaHTML(pedido, larguraImpressao, numComanda);
                          imprimir(html);
                        } else {
                          await imprimirPedidoSeguro(pedido);
                        }
                      }}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() =>
                        abrirConversaWhatsApp(pedido.cliente.telefone)
                      }
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* ITENS */}
                {
                  Object.entries(
                    pedido.itens.reduce((acc, item) => {
                      const cat = obterCategoriaItem(item);
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(item);
                      return acc;
                    }, {})
                  ).map(([categoria, itens]) => (

                    <Box key={categoria} sx={{ mb: 2 }}>

                      {/* TÍTULO DA CATEGORIA */}
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{
                          color: "text.secondary"
                        }}
                      >
                        🍽️ {categoria.toUpperCase()}
                      </Typography>

                      {/* ITENS DA CATEGORIA */}
                      {itens.map((item, index) => (
                        <Box key={index} >

                          <Typography fontWeight="bold">
                            {item.quantidade}x {item.nome}
                          </Typography>

                          {item.selecoes && Object.keys(item.selecoes).length > 0 && (
                            <Box >
                              {Object.entries(item.selecoes).map(([grupoId, grupo]) => (
                                <Typography key={grupoId} variant="body2">
                                  <strong>• {grupo.nome}:</strong>{" "}
                                  {grupo.itens
                                    .map(i =>
                                      i.valor > 0
                                        ? `${i.nome} (+R$ ${i.valor.toFixed(2)})`
                                        : i.nome
                                    )
                                    .join(", ")}
                                </Typography>
                              ))}
                            </Box>
                          )}

                          {item?.observacao && (
                            <Typography variant="body2">
                              <strong>• Obs:</strong> {item.observacao}
                            </Typography>
                          )}

                        </Box>
                      ))}

                    </Box>
                  ))
                }

                {/* AÇÕES */}
                {/* AÇÕES */}
                <Box sx={{ mt: "auto" }}>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ mt: 1 }}>
                    <Typography fontWeight="bold">
                      {pedido.cliente.formaPagamento.forma || "Total"}: R$ {pedido.total.toFixed(2)}
                      {pedido.cliente.endereco?.taxaEntrega > 0 && ` (Entrega: R$ ${pedido.cliente.endereco?.taxaEntrega.toFixed(2)})`}
                    </Typography>
                    {pedido.cliente.formaPagamento.obsPagamento && (
                      <Typography variant="body2">
                        <strong>Recebe:</strong> R$ {Number(pedido.cliente.formaPagamento.obsPagamento).toFixed(2)} e <strong>Devolve:</strong> R$ {(pedido.cliente.formaPagamento.obsPagamento - pedido.total).toFixed(2)}
                      </Typography>
                    )}
                  </Box>

                  {/* Container de botões unificado */}
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>

                    {/* BOTÃO PRINCIPAL (Preparar/Despachar/Finalizar) */}
                    {pedido.status === "pendente" && (
                      <Button variant="contained" color="success" fullWidth onClick={() => handlePreparar(pedido)}>
                        Preparar
                      </Button>
                    )}

                    {pedido.status === "preparando" && (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => {
                          if (pedido.retirarNaLoja || pedido.cliente.endereco?.placeId === "") {
                            handleDespachando(pedido, null);
                            return;
                          }
                          const skip = sessionStorage.getItem("dontAskAgain") === "true";
                          const ultimoMotoboy = sessionStorage.getItem("ultimoMotoboy");
                          if (skip && ultimoMotoboy) {
                            handleDespachando(pedido, ultimoMotoboy);
                          } else {
                            setPedidoParaDespachar(pedido);
                            setOpenModalMotoboys(true);
                          }
                        }}
                      >
                        {skip && ultimoMotoboy ? `Despachar (${ultimoMotoboy})` : "Despachar"}
                      </Button>
                    )}

                    {pedido.status === "despachando" && (
                      <Button variant="contained" color="success" fullWidth onClick={() => handleFinalizar(pedido)}>
                        Finalizar
                      </Button>
                    )}

                    {/* BOTÃO DE AÇÃO SECUNDÁRIA (Cancelar ou Excluir) */}
                    {["pendente", "preparando", "despachando"].includes(pedido.status) && (
                      <Button variant="outlined" color="error" fullWidth onClick={() => atualizarPedido(idLoja, pedido.id, { status: "cancelado" })}>
                        Cancelar
                      </Button>
                    )}

                    {["finalizado", "cancelado"].includes(pedido.status) && (
                      <Button variant="outlined" color="error" fullWidth onClick={() => {
                        setPedidoSelecionado(pedido);
                        setConfirmOpen(true);
                      }}>
                        Excluir
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            ))
            }
          </Box >
        )
      }

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPedidoSelecionado(null);
        }}
        title="Excluir pedido"
        message="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
        funcao={handleExcluir}
      />

      <MotoboyModal
        open={openModalMotoboys}
        onClose={() => setOpenModalMotoboys(false)}
        onSelect={(nome) => {
          // salva último motoboy
          sessionStorage.setItem("ultimoMotoboy", nome);

          if (pedidoParaDespachar) {
            handleDespachando(pedidoParaDespachar, nome);
            setPedidoParaDespachar(null);
          }
        }}
      />
    </Box >

  );
}