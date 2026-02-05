import {
  Box,
  Typography,
  Card,
  Toolbar,
  CircularProgress,
  Button
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import { useWhats } from "../../contexts/Whatsapp.Context";

export default function WhatsQR() {
  const { status, qr, loading, isDesktop, restartWhats } = useWhats();

  const renderContent = () => {
    if (!isDesktop) {
      return <Typography>WhatsApp disponível apenas no desktop</Typography>;
    }

    if (loading || status === "starting" || status === "preparando") {
      return (
        <>
          <Typography fontWeight="bold">
            Inicializando WhatsApp…
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </>
      );
    }

    if (status === "ready" || status === "authenticated") {
      return (
        <>
          <Typography fontWeight="bold">
            ✅ WhatsApp conectado
          </Typography>

          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={restartWhats}
          >
            Reiniciar sessão
          </Button>
        </>
      );
    }

    if (status === "qr" && qr) {
      return (
        <>
          <Typography fontWeight="bold">
            Escaneie o QR no WhatsApp
          </Typography>

          <Box
            component="img"
            src={qr}
            sx={{
              width: 280,
              mt: 2,
              borderRadius: 2,
              boxShadow: 2
            }}
          />
        </>
      );
    }

    if (status === "disconnected") {
      return (
        <>
          <Typography fontWeight="bold" color="error" gutterBottom>
            WhatsApp Desconectado
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A sessão foi encerrada pelo celular ou o computador está sem internet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={restartWhats}
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Gerar novo QR Code"}
          </Button>
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <Typography color="error">
            Erro ao iniciar WhatsApp
          </Typography>

          <Button sx={{ mt: 2 }} onClick={restartWhats}>
            Tentar novamente
          </Button>
        </>
      );
    }

    return <Typography>Status: {status}</Typography>;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Card
        sx={{
          p: 4,
          mt: 2,
          textAlign: "center",
          maxWidth: 420,
          mx: "auto"
        }}
      >
        {renderContent()}
      </Card>
    </Box>
  );
}
