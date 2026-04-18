import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Divider,
    Chip,
    Stack,
    Alert,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    CheckCircleOutline,
    ErrorOutline,
    Schedule,
    CreditCard,
    InfoOutlined,
    CancelOutlined,
    Refresh
} from "@mui/icons-material";

import { useState } from "react";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AdminAssinatura() {
    const { user } = useAuth();
    const { loja, idLoja } = useLoja();

    const APIURL = import.meta.env.VITE_API_RENDER_ASAAS;

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    if (!loja) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    const assinatura = loja.assinatura || {};

    // 🎨 Mapeamento de estilos para evitar excesso de 'ifs'
    const statusMap = {
        ativo: { color: "success", icon: <CheckCircleOutline fontSize="small" />, label: "Ativo" },
        trial: { color: "info", icon: <Schedule fontSize="small" />, label: "Período de Teste" },
        pendente: { color: "warning", icon: <InfoOutlined fontSize="small" />, label: "Pendente" },
        cancelado: { color: "error", icon: <CancelOutlined fontSize="small" />, label: "Cancelado" },
        atrasado: { color: "error", icon: <ErrorOutline fontSize="small" />, label: "Em Atraso" },
        pago: { color: "success", icon: <CreditCard fontSize="small" />, label: "Pago" },
    };

    const getStatusStyle = (status) => statusMap[status] || { color: "default", label: status || "—" };

    const handleAction = async (actionFn) => {
        try {
            setLoading(true);
            setErro("");
            const token = await user.getIdToken();
            await actionFn(token);
            window.location.reload();
        } catch (err) {
            setErro(err.response?.data?.message || "Ocorreu um erro na operação.");
        } finally {
            setLoading(false);
        }
    };

    const retryCobranca = () => handleAction((token) =>
        axios.post(`${APIURL}/retry-subscription`, { idLoja, cobranca: loja.cobranca }, { headers: { Authorization: `Bearer ${token}` } })
    );

    const cancelar = () => {
        if (window.confirm("Tem certeza que deseja cancelar sua assinatura?")) {
            handleAction((token) =>
                axios.delete(`${APIURL}/cancel-subscription/${assinatura.asaasSubscriptionId}`, { headers: { Authorization: `Bearer ${token}` } })
            );
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, margin: "0 auto" }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h5" fontWeight="700" color="text.primary">
                            Minha Assinatura
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gerencie seu plano e detalhes de faturamento
                        </Typography>
                    </Box>
                    <Tooltip title="Atualizar dados">
                        <IconButton onClick={() => window.location.reload()} size="small">
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Box sx={{ bgcolor: "action.hover", p: 3, borderRadius: 2, mb: 3 }}>
                    <Stack spacing={2}>
                        {/* Status Row */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">Status do Plano</Typography>
                            <Chip
                                icon={getStatusStyle(assinatura.status).icon}
                                label={getStatusStyle(assinatura.status).label}
                                color={getStatusStyle(assinatura.status).color}
                                variant="contained"
                                size="small"
                            />
                        </Box>

                        {/* Pagamento Row */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">Pagamento</Typography>
                            <Chip
                                label={getStatusStyle(assinatura.statusPagamento).label}
                                color={getStatusStyle(assinatura.statusPagamento).color}
                                variant="outlined"
                                size="small"
                            />
                        </Box>

                        <Divider />

                        {/* Plano Info */}

                        <Box display="flex" justifyContent="space-between" alignItems="center">

                            <Typography
                                variant="caption"
                                sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                            >
                                Plano Atual
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="600">
                                {assinatura.plano || "Nenhum plano selecionado"}
                            </Typography>
                            {assinatura.trialEndsAt && (
                                <Typography variant="body2" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Schedule sx={{ fontSize: 16 }} /> Trial termina em: {new Date(assinatura.trialEndsAt.seconds * 1000).toLocaleDateString()}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Box>

                {/* ALERTAS E ERROS */}
                {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

                {assinatura.requiresAction && (
                    <Alert severity="warning" variant="filled" sx={{ mb: 2 }}>
                        Sua assinatura requer atenção para evitar a interrupção do serviço.
                    </Alert>
                )}

                {/* BOTÕES DE AÇÃO */}
                <Stack spacing={2} mt={4}>
                    {(assinatura.requiresAction || assinatura.statusPagamento === "atrasado") && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={retryCobranca}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <CreditCard />}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                        >
                            Regularizar Assinatura
                        </Button>
                    )}

                    {assinatura.asaasSubscriptionId && (
                        <Button
                            variant="text"
                            color="error"
                            onClick={cancelar}
                            disabled={loading}
                            startIcon={<CancelOutlined />}
                            sx={{ textTransform: "none", "&:hover": { bgcolor: "error.lighter" } }}
                        >
                            Cancelar Assinatura
                        </Button>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}