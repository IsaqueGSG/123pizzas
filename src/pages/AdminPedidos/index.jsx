import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Divider
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import ModalAtivarAudio from "../../components/ModalAtivarAudio";

import { updatePedidoStatus, aceitarPedido, escutarPedidos } from "../../services/pedidos.service";
import { geraComandaHTML80mm, imprimir, marcarComoImpresso } from "../../services/impressora.service";
import { enviarMensagem } from "../../services/whatsapp.service";
import { tocarAudio } from "../../services/audio.service";
import campainha from "../../assets/audios/campainha.mp3"

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstLoad = useRef(true);

  useEffect(() => {
    const unsub = escutarPedidos((snapshot) => {
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
      setLoading(false)
    });

    return unsub;
  }, []);


  const handleAceitar = async (pedido) => {
    try {
      // 1️⃣ Atualiza status
      await aceitarPedido(pedido.id);

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
      await marcarComoImpresso(pedido.id);

    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      alert("Erro ao aceitar pedido");
    }
  };

  const handleCancelar = async (pedido) => {
    await updatePedidoStatus(pedido.id, "cancelado");
  };


  return (
    <Box sx={{ p: 2 }}>
      <ModalAtivarAudio />
      <Navbar />
      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Pedidos
      </Typography>

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
              {pedidos.map((pedido) => (
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
                        {item.nome} x{item.quantidade}
                      </Typography>

                      <Typography variant="body2">
                        Borda: {item.extras?.borda || "Sem borda"}
                      </Typography>

                      {item.obs && (
                        <Typography variant="body2">
                          Obs: {item.obs}
                        </Typography>
                      )}
                    </Box>
                  ))}

                  {/* AÇÕES */}
                  {pedido.status === "pendente" && (
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Divider sx={{ mb: 1 }} />

                      <Typography fontWeight="bold">
                        Total: R$ {pedido.total.toFixed(2)}
                      </Typography>

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
                    </Box>
                  )}

                </Card>
              ))}
            </Box>
          </>
        )
      }
    </Box>
  );
}