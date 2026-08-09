import { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Card,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    CircularProgress,
    Toolbar,
    Select,
    MenuItem,
    IconButton,
    Alert
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { usePreferencias } from "../../contexts/PreferenciasContext";

const DIAS_SEMANA = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado", 
    "domingo"
];

export default function AdminHorarios() {
    const { preferencias, atualizarPreferencias, loading } = usePreferencias();
    const [prefs, setPrefs] = useState(preferencias);

    useEffect(() => {
        setPrefs(preferencias);
    }, [preferencias]);

    const atualizarHorario = (dia, campo, valor) => {
        setPrefs(prev => ({
            ...prev,
            horarios: {
                ...(prev.horarios || {}),
                [dia]: {
                    ...(prev.horarios?.[dia] || {}),
                    [campo]: valor
                }
            }
        }));
    };

    const guardarPreferencias = async () => {
        await atualizarPreferencias(prefs);
        console.log("preferencias salvas: ", prefs);
        alert("Preferências salvas com sucesso!");
    };

    const houveMudanca = useMemo(() => {
        return (JSON.stringify(prefs) !== JSON.stringify(preferencias));
    }, [prefs, preferencias]);

    if (loading) {
        return (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, pb: 8 }}>

            <AdminDrawer />

            {/* HORÁRIOS */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography fontWeight="bold" gutterBottom>
                    🕒 Horário de funcionamento
                </Typography>

                {DIAS_SEMANA.map(dia => {
                    // 1. Criamos uma referência segura para os dados do dia
                    const config = prefs?.horarios?.[dia] || { ativo: false, inicio: "00:00", fim: "00:00" };

                    return (
                        <Card key={dia} variant="outlined" sx={{ mb: 1.5, p: 1.5, bgcolor: config.ativo ? 'inherit' : '#f5f5f5' }}>
                            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                                <FormControlLabel
                                    sx={{ minWidth: 140 }}
                                    control={
                                        <Switch
                                            checked={config.ativo}
                                            onChange={e => atualizarHorario(dia, "ativo", e.target.checked)}
                                        />
                                    }
                                    label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                                />

                                {config.ativo && (
                                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <TextField
                                            label="Início"
                                            type="time"
                                            size="small"
                                            InputLabelProps={{ shrink: true }} // Garante que o label não suba no ícone
                                            value={config.inicio || "00:00"}
                                            onChange={e => atualizarHorario(dia, "inicio", e.target.value)}
                                        />
                                        <Typography variant="body2">até</Typography>
                                        <TextField
                                            label="Fim"
                                            type="time"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={config.fim || "00:00"}
                                            onChange={e => atualizarHorario(dia, "fim", e.target.value)}
                                        />

                                        {/* 2. Lógica visual para horários que viram a noite */}
                                        {config.fim < config.inicio && config.fim !== "00:00" && screen.width > 400 && (
                                            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                                                ⚠️ Este horário atravessa a meia-noite de {dia.charAt(0).toUpperCase() + dia.slice(1)} para o próximo dia.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    );
                })}
            </Card>

            {/* SALVAR */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    bgcolor: "background.paper",
                    p: 2,
                    boxShadow: "0 -2px 10px rgba(0,0,0,.3)"
                }}
            >
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!houveMudanca}
                    onClick={guardarPreferencias}
                >
                    {
                        !houveMudanca
                            ? "Nenhuma alteração"
                            : "Salvar preferências"}
                </Button>
            </Box>
        </Box >
    );
}
