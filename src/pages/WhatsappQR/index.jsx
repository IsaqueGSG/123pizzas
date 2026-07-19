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
            {status === "error" ? "Erro ao iniciar conexão" : "Preparando conexão..."}
          </Typography>
          
          <CircularProgress sx={{ mb: 2 }} />
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

        {/* 🔽 Botão de Reset (Sempre visível se não estiver 'ready' para emergências) */}
        {isDesktop && status !== "ready" && (
          <Box sx={{ mt: 4, pt: 2, borderTop: "1px dashed #ccc" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              O QR não aparece ou a conexão está travada?
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              onClick={restartWhats}
            >
              Forçar reinicialização total
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}