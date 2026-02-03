import { Box, Typography, Card, Toolbar, CircularProgress } from "@mui/material";
import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { useWhats } from "../../contexts/Whatsapp.Context";

export default function WhatsQR() {
  const { status, qr } = useWhats();

  const isDesktop = !!window.electronAPI;

  if (!isDesktop) {
    return (
      <Box sx={{ p: 2 }}>
        <Navbar />
        <Toolbar />
        <AdminDrawer />

        <Card sx={{ p: 3 }}>
          <Typography>
            WhatsApp disponível apenas na versão desktop.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      {status === "starting" && (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography fontWeight="bold">
            Inicializando engine do WhatsApp…
          </Typography>
          <CircularProgress />
        </Card>
      )}

      {(status === "ready" || status === "authenticated") && (
        <Card sx={{ p: 3 }}>
          <Typography fontWeight="bold">
            ✅ WhatsApp conectado
          </Typography>
        </Card>
      )}

      {status === "qr" && qr && (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography fontWeight="bold" gutterBottom>
            Escaneie o QR do WhatsApp
          </Typography>
          <Box component="img" src={qr} sx={{ width: 260 }} />
        </Card>
      )}

      {status === "disconnected" && (
        <Card sx={{ p: 3 }}>
          <Typography fontWeight="bold" color="error">
            WhatsApp desconectado
          </Typography>
        </Card>
      )}
    </Box>
  );
}
