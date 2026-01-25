import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Toolbar
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import ModalAtivarAudio from "../../components/ModalAtivarAudio";
import ConfirmDialog from "../../components/ConfirmDialog";

import { updatePedidoStatus, aceitarPedido, escutarPedidos, deletarPedido, marcarComoImpresso } from "../../services/pedidos.service";
import { geraComandaHTML80mm, imprimir } from "../../services/impressora.service";
import { enviarMensagem } from "../../services/whatsapp.service";
import { tocarAudio } from "../../services/audio.service";
import campainha from "../../assets/audios/campainha.mp3"

import { useLoja } from "../../contexts/LojaContext";

export default function AdminPedidos() {
  const { idLoja } = useLoja()

  const statusTabs = ["pendente", "aceito", "cancelado", "finalizado"];
  const [abaAtiva, setAbaAtiva] = useState(0);


  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const firstLoad = useRef(true);

  useEffect(() => {
    const unsub = escutarPedidos(idLoja, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (
          change.type === "added" &&
          change.doc.data().status === "pendente" &&
          !firstLoad.current
        ) {
          tocarAudio(campainha);
        }

      });

      firstLoad.current = false;
      setPedidos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      console.log(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false)
    });

    return unsub;
  }, []);


  const handleAceitar = async (pedido) => {
    try {
      // 1️⃣ Atualiza status
      await aceitarPedido(idLoja, pedido.id);

      // 2️⃣ WhatsApp
      enviarMensagem(pedido);

      // 3️⃣ Gera comanda
      const html = geraComandaHTML80mm({
        ...pedido,
        status: "aceito"
      });

      // 4️⃣ Imprime
      imprimir(html);

      // 5️⃣ Marca como impresso
      await marcarComoImpresso(idLoja, pedido.id);

    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      alert("Erro ao aceitar pedido");
    }
  };

  const handleCancelar = async (pedido) => {
    await updatePedidoStatus(idLoja, pedido.id, "cancelado");
  };

  const handleExcluir = async () => {
    if (!pedidoSelecionado) return;

    const podeExcluir = !["pendente", "aceito"].includes(pedidoSelecionado.status);

    if (!podeExcluir) {
      alert("Pedidos pendentes ou aceitos não podem ser excluídos.");
      return;
    }

    try {
      await deletarPedido(idLoja, pedidoSelecionado.id);
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      alert("Erro ao excluir pedido");
    }
  };

  const pedidosFiltrados = pedidos
    .filter(p => p.status === statusTabs[abaAtiva])
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    console.log(pedidosFiltrados)

  return (
    <Box sx={{ p: 2 }}>
      <ModalAtivarAudio />
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Pedidos
      </Typography>

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

                    <Chip
                      label={pedido.status}
                      color={
                        pedido.status === "pendente"
                          ? "warning"
                          : pedido.status === "aceito"
                            ? "success"
                            : "default"
                      }
                    />
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

                      {item.extras?.borda && (
                        <Typography variant="body2">
                          Borda: {item.extras?.borda?.nome || "Sem borda"}
                        </Typography>

                      )}

                      {item.extras?.adicionais?.length > 0 && (
                        <Typography variant="body2">
                          Extras:{" "}
                          {item.extras.adicionais
                            .map((e) => `${e.nome} (+R$ ${e.valor.toFixed(2)})`)
                            .join(", ")}
                        </Typography>
                      )}

                      {item.extras?.obs && (
                        <Typography variant="body2">
                          Obs: {item.extras.obs}
                        </Typography>
                      )}

                      <Typography variant="body2" fontWeight="bold">
                        Subtotal: R$ {(item.valor * item.quantidade).toFixed(2)}
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
                          onClick={() => handleAceitar(pedido)}
                        >
                          Aceitar
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => handleCancelar(pedido)}
                        >
                          Recusar
                        </Button>
                      </Box>
                    )}

                    {/* AÇÃO DE EXCLUSÃO */}
                    {!["pendente", "aceito"].includes(pedido.status) && (
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