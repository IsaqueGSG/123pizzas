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

import AdminDrawer from "../../components/AdminDrawer";
import ConfirmDialog from "../../components/ConfirmDialog";

import { deletarPedido, atualizarPedido, processarPedido } from "../../services/pedidos.service";
import { imprimir, geraComandaHTML } from "../../services/impressora.service";
import { enviarMensagem } from "../../services/whatsapp.service";

import { useLoja } from "../../contexts/LojaContext";
import { usePreferencias } from "../../contexts/PreferenciasContext";
import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";

export default function AdminPedidos() {
  const { idLoja } = useLoja()
  const { preferencias } = usePreferencias();
  const { pedidos, loading, autoAceitarPedidos, toggleAutoAceitar } = usePedidosRealtime();

  const statusTabs = ["pendente", "preparando", "finalizado", "cancelado"];
  const [abaAtiva, setAbaAtiva] = useState(0);

  const [dataFiltro, setDataFiltro] = useState(
    new Date().toLocaleDateString("sv-SE")
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const handlePreparar = async (pedido) => {
    if (pedido.impresso) return;
    try {
      await processarPedido({
        idLoja,
        pedido,
        preferencias
      });

    } catch (error) {
      console.error("Erro ao iniciar preparo:", error);
      alert("Erro ao iniciar preparo");
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

  console.log(pedidosFiltrados);


  const contadoresStatus = useMemo(() => {
    const contadores = {
      pendente: 0,
      preparando: 0,
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
          <>
            <Box
              sx={{
                mt: 3,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)"
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

                  {/* CABEÇALHO */}
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography fontWeight="bold">
                        {pedido.cliente?.nome} - {new Date(pedido.createdAt.seconds * 1000).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pedido.retirarNaLoja ?
                          "Retirar na loja" :
                          (() => {
                            const { rua, numero, bairro } = pedido.cliente?.endereco;
                            return `${rua}, ${numero} - ${bairro}`;
                          })()}
                      </Typography>
                    </Box>

                    <Box>
                      <IconButton
                        color="inherit"
                        onClick={async () => {
                          const larguraImpressao = preferencias?.impressao?.largura || "80mm";
                          if (!window.electronAPI) {
                            const html = geraComandaHTML(pedido, larguraImpressao);
                            imprimir(html);
                          } else {
                            console.log("impressao electron")
                            const result = await window.electronAPI.imprimirPedido(pedido, larguraImpressao);
                            console.log("RESULTADO IMPRESSÃO:", result);
                          }
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                      <IconButton
                        color="inherit"
                        onClick={async () => enviarMensagem(pedido, "")}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* ITENS */}
                  {pedido.itens.map((item, index) => (
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


                  {/* AÇÕES */}
                  <Box sx={{ mt: "auto", pt: 2 }}>
                    <Divider sx={{ mb: 1 }} />

                    <Box>
                      <Typography fontWeight="bold">
                        Total: R$ {pedido.total.toFixed(2)}
                      </Typography>
                      <Typography fontWeight="bold">
                        Forma de pagamento: {pedido.cliente.formaPagamento.forma} {pedido.cliente.formaPagamento.obs ? `- ${pedido.cliente.formaPagamento.obs}` : "" }
                      </Typography>
                    </Box>

                    {/* AÇÕES PARA PENDENTE */}
                    {pedido.status === "pendente" && (
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          onClick={() => handlePreparar(pedido)}
                        >
                          Iniciar preparo
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => atualizarPedido(idLoja, pedido.id, { status: "cancelado" })}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    )}

                    {/* AÇÃO DE EXCLUSÃO */}
                    {!["pendente", "preparando"].includes(pedido.status) && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => {
                            setPedidoSelecionado(pedido);
                            setConfirmOpen(true);
                          }}
                        >
                          Excluir Pedido
                        </Button>

                      </>
                    )}

                    {pedido.status === "preparando" && (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => atualizarPedido(idLoja, pedido.id, { status: "finalizado" })}
                      >
                        Finalizar pedido
                      </Button>
                    )}

                  </Box>
                </Card>
              ))}
            </Box>
          </>
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

    </Box>
  );
}