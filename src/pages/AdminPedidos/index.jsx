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
  Toolbar
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import ConfirmDialog from "../../components/ConfirmDialog";

import { updatePedidoStatus, deletarPedido, marcarComoImpresso } from "../../services/pedidos.service";
import { imprimir, geraComandaHTML } from "../../services/impressora.service";
import { enviarMensagemElectron } from "../../services/whatsapp.service";

import { useLoja } from "../../contexts/LojaContext";
import { usePreferencias } from "../../contexts/PreferenciasContext";
import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";

export default function AdminPedidos() {
  const { idLoja } = useLoja()
  const { preferencias } = usePreferencias();
  const { pedidos, loading } = usePedidosRealtime();

  const statusTabs = ["pendente", "preparando", "finalizado", "cancelado"];
  const [abaAtiva, setAbaAtiva] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const handlePreparar = async (pedido) => {
    try {
      await updatePedidoStatus(idLoja, pedido.id, "preparando");

      enviarMensagemElectron(idLoja, pedido);

      const larguraImpressao = preferencias?.impressao?.largura || "80mm";
      if (!window.electronAPI) {
        const html = geraComandaHTML(pedido, larguraImpressao);
        imprimir(html);
      } else {
        console.log("impressao electron")
        const result = await window.electronAPI.imprimirPedido(pedido, larguraImpressao);
        console.log("RESULTADO IMPRESSÃO:", result);
      }

      await marcarComoImpresso(idLoja, pedido.id);

    } catch (error) {
      console.error("Erro ao iniciar preparo:", error);
      alert("Erro ao iniciar preparo");
    }
  };

  const handleCancelar = async (pedido) => {
    await updatePedidoStatus(idLoja, pedido.id, "cancelado");
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

  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter(p => p.status === statusTabs[abaAtiva])
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [pedidos, abaAtiva]);


  return (
    <Box sx={{ p: 2 }}>

      <AdminDrawer />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Gestão de pedidos
        </Typography>


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
            label={`${status.toUpperCase()} (${pedidos.filter(p => p.status === status).length})`}
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
                        {pedido.cliente?.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(
                          pedido.createdAt.seconds * 1000
                        ).toLocaleString()}
                      </Typography>
                    </Box>

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

                    <Typography fontWeight="bold">
                      Total: R$ {pedido.total.toFixed(2)}
                    </Typography>

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
                          onClick={() => handleCancelar(pedido)}
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
                        onClick={() => updatePedidoStatus(idLoja, pedido.id, "finalizado")}
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