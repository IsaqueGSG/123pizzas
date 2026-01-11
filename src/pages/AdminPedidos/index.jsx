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

import { getPedidos, updatePedidoStatus } from "../../services/pedidos.service";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPedidos() {
    const data = await getPedidos();
    setPedidos(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPedidos();
  }, []);

  const mudarStatus = async (id, status) => {
    await updatePedidoStatus(id, status);
    loadPedidos();
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
            xs: "1fr",              // mobile
            sm: "repeat(2, 1fr)",   // tablets
            md: "repeat(3, 1fr)"    // desktop
          },
          gap: 2
        }}
      >
        {pedidos.map((pedido) => (
          <Card
            key={pedido.id}
            sx={{
              mb: 2,
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

                {item.extras?.extras?.length > 0 && (
                  <Typography variant="body2">
                    Extras:{" "}
                    {item.extras.extras.map((e) => e.nome).join(", ")}
                  </Typography>
                )}

                {item.obs && (
                  <Typography variant="body2">
                    Obs: {item.obs}
                  </Typography>
                )}
              </Box>
            ))}


            {/* AÇÕES */}
            {pedido.status === "pendente" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: "auto",   // empurra para o final do card
                  pt: 2
                }}
              >

                <Box>
                  <Divider sx={{ my: 1 }} />
                  {/* TOTAL */}
                  <Typography fontWeight="bold">
                    Total: R$ {pedido.total.toFixed(2)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => mudarStatus(pedido.id, "aceito")}
                  >
                    Aceitar
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => mudarStatus(pedido.id, "cancelado")}
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
