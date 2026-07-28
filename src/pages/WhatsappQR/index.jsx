import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Button
} from "@mui/material";

import AdminDrawer from "../../components/AdminDrawer";
import { useWhats } from "../../contexts/Whatsapp.Context";

export default function WhatsQR() {
  const { status, qr, numero, isDesktop, restartWhats, logoutWhats } = useWhats();

  const formatarNumero = (num) => {
    if (!num) return "Carregando...";
    const n = num.replace(/^55/, "");
    if (n.length >= 11) {
      return `+55 ${n.slice(0, 2)} ${n.slice(2, 7)}-${n.slice(7)}`;
    }
    return `+${num}`;
  };

  const renderContent = () => {
    if (!isDesktop) {
      return <Typography>WhatsApp disponível apenas no desktop</Typography>;
    }

    // Status: READY
    if (status === "ready") {
      return (
        <>
          <Typography fontWeight="bold" fontSize={18} color="success.main">
            ✅ WhatsApp conectado
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            Número conectado:
          </Typography>
          <Typography fontWeight="bold" sx={{ mb: 3 }}>
            {formatarNumero(numero)}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={logoutWhats}
          >
            Encerrar sessão
          </Button>
        </>
      );
    }

    // Status: ERROR ou Desconectado sem QR
    if (status === "error" || (!qr && status !== "ready")) {
      return (
        <>
          <Typography fontWeight="bold" sx={{ mb: 2 }}>
            {status === "error" ? "Erro ao iniciar conexão" : "Aguardando resposta do WhatsApp..."}
          </Typography>

          <CircularProgress sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Se esta etapa demorar muito, a sessão pode ter expirado.
          </Typography>
        </>
      );
    }

    // Status: TEM QR (Escaneamento)
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
            boxShadow: 2,
            border: "1px solid #eee"
          }}
        />
      </>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
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

        {isDesktop &&(
          <Box sx={{ mt: 4, pt: 2, borderTop: "1px dashed #ccc" }}>
            <Button
              variant="outlined"
              color="warning"
              onClick={restartWhats}
              fullWidth
            >
              Forçar reinicialização total (Limpar Dados)
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}