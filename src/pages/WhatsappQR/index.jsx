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
    const lojaAtual = localStorage.getItem("idLoja") || idLoja;

    useEffect(() => {
        if (isDesktop && lojaAtual) {
            console.log("[RENDERER] INIT WHATS:", lojaAtual);
            window.electronAPI.initWhats(lojaAtual)
                .then(r => console.log("[RENDERER] init retorno:", r));
        }
    }, [isDesktop, lojaAtual]);


    useEffect(() => {
        if (!isDesktop || !lojaAtual) return;

        const offQR = window.electronAPI.onWhatsQR((data) => {
            console.log("[RENDERER] QR EVENT:", data);

            if (data.idLoja !== lojaAtual) return;
            setQr(data.qr);
            setStatus("qr");
        });

        const offStatus = window.electronAPI.onWhatsStatus((data) => {
            console.log("[RENDERER] STATUS EVENT:", data);

            if (data.idLoja !== lojaAtual) return;

            setStatus(data.status);

            if (data.status === "ready" || data.status === "authenticated") {
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
