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
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { deletarPedido, atualizarPedido } from "../../services/pedidos.service";
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
  const { preferencias } = usePreferencias();
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

  const handlePreparar = async (pedido) => {
    if (pedido.impresso) return;
    try {
      await atualizarPedido(idLoja, pedido.id, { status: "preparando" });

      const texto = gerarMensagemConfirmacao(pedido);

      await enviarMensagemWhatsApp(
        idLoja,
        pedido.cliente.telefone,
        texto
      );

      const largura = preferencias?.impressao?.largura || "80mm";

      if (!window.electronAPI) {
        const html = geraComandaHTML(pedido, largura);
        imprimir(html);
      } else {
        try {
          await window.electronAPI.imprimirPedido(pedido, largura);
        } catch (error) {
          alert("Erro ao imprimir no Electron:", error);
          const html = geraComandaHTML(pedido, largura);
          imprimir(html);
        }
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

      const texto = `Olá ${pedido.cliente.nome}, seu pedido foi finalizado ! \n Agradecemos pela preferência e esperamos vê-lo novamente em breve!`;

      await enviarMensagemWhatsApp(
        idLoja,
        pedido.cliente.telefone,
        texto
      );

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
      await deletarPedido(idLoja, pedidoSelecionado.id);
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

  return (
    <Box sx={{ p: 2 }}>

      <AdminDrawer />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Gestão de pedidos
        </Typography>

        <input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={autoAceitarPedidos}
              onChange={toggleAutoAceitar}
            />
          }
          label="Aceitar e imprimir automaticamente"
        />

        <Button
          variant="contained"
          onClick={() => {
            const url = `${window.location.origin}/${idLoja}`;

            if (window.electronAPI) {
              // No Electron: Abre no navegador padrão do sistema
              window.electronAPI.openExternal(url);
            } else {
              // No Navegador: Abre em uma nova aba
              window.open(url, '_blank', 'noreferrer');
            }
          }}
        >
          Criar Pedido
        </Button>
      </Box>

      <Divider sx={{ mt: 2 }} />

      <Tabs
        value={abaAtiva}
        onChange={(e, newValue) => setAbaAtiva(newValue)}
        sx={{ mb: 3 }}
        variant="fullWidth"
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1 }}>

                    {/* Nome do Cliente e Data */}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {pedido.cliente?.nome}  {new Date(pedido.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(pedido.createdAt.seconds * 1000).toLocaleDateString()}
                    </Typography>

                    {/* Endereço/Localização */}
                    <Typography variant="body2" color="text.secondary" >
                      {pedido.retirarNaLoja ? (
                        "📍 Retirar na Loja"
                      ) : (
                        <>
                          {pedido.cliente?.endereco?.rua}, {pedido.cliente?.endereco?.numero} {pedido.cliente?.endereco?.bairro}
                        </>
                      )}
                    </Typography>
                  </Box>

                  {/* Ações Rápidas */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      color="primary"
                      onClick={async () => {
                        const larguraImpressao = preferencias?.impressao?.largura || "80mm";
                        if (!window.electronAPI) {
                          const html = geraComandaHTML(pedido, larguraImpressao);
                          imprimir(html);
                        } else {
                          await window.electronAPI.imprimirPedido(pedido, larguraImpressao);
                        }
                      }}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
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
                {Object.entries(
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
                        mt: 1,
                        mb: 0.5,
                        color: "text.secondary"
                      }}
                    >
                      🍽️ {categoria.toUpperCase()}
                    </Typography>

                    {/* ITENS DA CATEGORIA */}
                    {itens.map((item, index) => (
                      <Box key={index} sx={{ mb: 1 }}>

                        <Typography fontWeight="bold">
                          {item.quantidade}x {item.nome}
                        </Typography>

                        <Typography variant="body2">
                          Valor unitário: R$ {item.valor.toFixed(2)}
                        </Typography>

                        {item.borda?.nome && (
                          <Typography variant="body2">
                            Borda: {item.borda.nome}
                          </Typography>
                        )}

                        {Array.isArray(item.extras) && item.extras.length > 0 && (
                          <Typography variant="body2">
                            Extras:{" "}
                            {item.extras
                              .map((e) => `${e.nome} (+R$ ${e.valor.toFixed(2)})`)
                              .join(", ")}
                          </Typography>
                        )}

                        {item?.observacao && (
                          <Typography variant="body2">
                            Obs: {item.observacao}
                          </Typography>
                        )}

                        <Typography variant="body2" fontWeight="bold">
                          Subtotal: R$ {(item.valor * (item.quantidade ?? 1)).toFixed(2)}
                        </Typography>

                      </Box>
                    ))}

                  </Box>
                ))}

                {/* AÇÕES */}
                <Box sx={{ mt: "auto" }}>
                  <Divider sx={{ mb: 1 }} />

                  <Box sx={{ mt: 1 }}>
                    <Typography fontWeight="bold">
                      Total: R$ {pedido.total.toFixed(2)}
                    </Typography>
                    <Typography fontWeight="bold">
                      Forma de pagamento: {pedido.cliente.formaPagamento.forma} {pedido.cliente.formaPagamento.obs ? `- ${pedido.cliente.formaPagamento.obs}` : ""}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>


                    {/* AÇÕES PARA PENDENTE */}
                    {pedido.status === "pendente" && (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handlePreparar(pedido)}
                      >
                        Preparar
                      </Button>
                    )}

                    {pedido.status === "preparando" && (
                      <Button
                        sx={{ mt: 1 }}
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => {
                          // 👉 se for retirada, nem precisa motoboy
                          if (pedido.retirarNaLoja) {
                            handleDespachando(pedido, null);
                            return;
                          }

                          const skip = sessionStorage.getItem("dontAskAgain") === "true";
                          const ultimoMotoboy = sessionStorage.getItem("ultimoMotoboy");

                          if (skip && ultimoMotoboy) {
                            // 🚀 automático
                            handleDespachando(pedido, ultimoMotoboy);
                          } else {
                            // 🧠 abre modal
                            setPedidoParaDespachar(pedido);
                            setOpenModalMotoboys(true);
                          }
                        }}
                      >
                        {skip && ultimoMotoboy
                          ? `Despachar (${ultimoMotoboy})`
                          : "Despachar"}
                      </Button>
                    )}

                    {pedido.status === "despachando" && (
                      <Button
                        sx={{ mt: 1 }}
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handleFinalizar(pedido)}
                      >
                        Finalizar
                      </Button>
                    )}

                    {/* AÇÃO DE CANCELAMENTO */}
                    {["pendente", "preparando", "despachando"].includes(pedido.status) && (
                      <Button
                        sx={{ mt: 1 }}
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => atualizarPedido(idLoja, pedido.id, { status: "cancelado" })}
                      >
                        Cancelar
                      </Button>
                    )}

                    {/* AÇÃO DE EXCLUSÃO */}
                    {["finalizado", "cancelado"].includes(pedido.status) && (
                      <Button
                        sx={{ mt: 1 }}
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => {
                          setPedidoSelecionado(pedido);
                          setConfirmOpen(true);
                        }}
                      >
                        Excluir
                      </Button>
                    )}
                  </Box>

                </Box>
              </Card>
            ))}
          </Box>
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
    </Box>

  );
}