import { useEffect, useState } from "react";
import { Box, Typography, Card, Toolbar, CircularProgress } from "@mui/material";
import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { useLoja } from "../../contexts/LojaContext";

export default function WhatsQR() {
    const [qr, setQr] = useState(null);
    const [status, setStatus] = useState("loading");

    const { idLoja } = useLoja()

    const isDesktop = !!window.electronAPI;
    const lojaAtual = localStorage.getItem("idLoja") || idLoja ;

    useEffect(() => {
        if (isDesktop && lojaAtual) {
            window.electronAPI.initWhats(lojaAtual);
        }
    }, [isDesktop, lojaAtual]);


    useEffect(() => {
        if (!isDesktop || !lojaAtual) return;

        const offQR = window.electronAPI.onWhatsQR(({ idLoja, qr }) => {
            if (idLoja !== lojaAtual) return;
            setQr(qr);
            setStatus("qr");
        });

        const offStatus = window.electronAPI.onWhatsStatus(({ idLoja, status }) => {
            if (idLoja !== lojaAtual) return;

            setStatus(status);

            if (status === "ready" || status === "authenticated") {
                setQr(null);
            }
        });

        return () => {
            offQR();
            offStatus();
        };
    }, [isDesktop, lojaAtual]);

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

            {(status === "ready" || status === "authenticated") && (
                <Card sx={{ p: 3 }}>
                    <Typography fontWeight="bold">
                        ✅ WhatsApp conectado
                    </Typography>
                </Card>
            )}

            {status === "loading" && (
                <Card sx={{ p: 3, textAlign: "center" }}>
                    <Typography fontWeight="bold" gutterBottom>
                        Iniciando WhatsApp…
                    </Typography>
                    <CircularProgress />
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
