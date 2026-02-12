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

    // ready
    if (status === "ready") {
      return (
        <Typography fontWeight="bold">
          ✅ WhatsApp conectado
        </Typography>
      );
    }

    // error
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

    // 🔥 Se está desconectado mas ainda não tem QR
    if (!qr) {
      return (
        <>
          <Typography fontWeight="bold">
            Preparando conexão...
          </Typography>

          <CircularProgress sx={{ mt: 2 }} />
        </>
      );
    }

    // 🔥 Se tem QR
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
