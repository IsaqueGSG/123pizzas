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

    // ready
    if (status === "ready") {
      return (
        <>
          <Typography fontWeight="bold" fontSize={18}>
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

        {/* 🔽 Ações extras somente quando desconectado */}
        {isDesktop && status !== "ready" && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 3, display: "block" }}
            >
              QR não carregou? Gere um novo código abaixo.
            </Typography>

            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              onClick={restartWhats}
            >
              Gerar novo QR
            </Button>
          </>
        )}
      </Card>
    </Box>
  );
}
