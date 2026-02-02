import { useEffect, useState } from "react";
import { Box, Typography, Card, Toolbar, CircularProgress } from "@mui/material";
import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

export default function WhatsQR() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("loading");

  const isDesktop = !!window.electronAPI;

  useEffect(() => {
    if (!isDesktop) return;

    const offQR = window.electronAPI.onWhatsQR((data) => {
      setQr(data);
      setStatus("qr");
    });

    const offStatus = window.electronAPI.onWhatsStatus((s) => {
      setStatus(s);

      // se conectou → limpa QR
      if (s === "ready" || s === "authenticated") {
        setQr(null);
      }
    });

    return () => {
      offQR();
      offStatus();
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <Box sx={{ p: 2 }}>
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

      {/* CONECTADO */}
      {(status === "ready" || status === "authenticated") && (
        <Card sx={{ p: 3 }}>
          <Typography fontWeight="bold">
            ✅ WhatsApp conectado
          </Typography>
        </Card>
      )}

      {/* GERANDO QR */}
      {status === "loading" && (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography fontWeight="bold" gutterBottom>
            Iniciando WhatsApp…
          </Typography>
          <CircularProgress />
        </Card>
      )}

      {/* QR */}
      {status === "qr" && qr && (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography fontWeight="bold" gutterBottom>
            Escaneie o QR do WhatsApp
          </Typography>

          <Box component="img" src={qr} sx={{ width: 260 }} />
        </Card>
      )}

      {/* DESCONECTADO */}
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
