import { useEffect, useState } from "react";
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

import { getPedidos, updatePedidoStatus, aceitarPedido, escutarPedidos } from "../../services/pedidos.service";
import { enviarMensagem } from "../../services/whatsapp.service";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // 🔥 inicia escuta em tempo real
    const unsubscribe = escutarPedidos((pedidosAtualizados) => {
      setPedidos(pedidosAtualizados);
      setLoading(false);
    });

    // 🔥 remove listener ao sair da tela
    return () => unsubscribe();
  }, []);

  const mudarStatus = async (pedido, status) => {
    if (status === "aceito") {
      // WhatsApp
      enviarMensagem(pedido);

      await aceitarPedido(pedido.id);
    } else {
      await updatePedidoStatus(pedido.id, status);
    }
  };

  if (loading) {
    return <Typography sx={{ p: 3 }}>Carregando pedidos...</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Pedidos
      </Typography>

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
                    onClick={() => mudarStatus(pedido, "aceito")}
                  >
                    Aceitar
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => mudarStatus(pedido, "cancelado")}
                  >
                    Recusar
                  </Button>

                </Box>
              </Box>
            )}

          </Card>
        ))}
      </Box>
    </Box>
  );
}
