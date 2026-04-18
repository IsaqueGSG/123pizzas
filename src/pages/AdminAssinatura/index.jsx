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
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import {
    CheckCircleOutline,
    ErrorOutline,
    Schedule,
    CreditCard,
    InfoOutlined,
    CancelOutlined,
    Refresh,
    WhatsApp,
    EmailOutlined,
    Storefront,
    CalendarMonth
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AdminAssinatura() {
    const { user } = useAuth();
    const { loja, idLoja } = useLoja();
    console.log(loja)
    const APIURL = import.meta.env.VITE_API_RENDER_ASAAS;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState("");

    // Estados para os campos editáveis baseados na estrutura real da sua 'loja'
    const [formData, setFormData] = useState({
        email: "",
        mobilePhone: ""
    });

    useEffect(() => {
        if (loja) {
            setFormData({
                email: loja.email || "", // assume-se que existam na raiz da loja
                mobilePhone: loja.mobilePhone || ""
            });
        }
    }, [loja, open]);

    if (!loja) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    const assinatura = loja.assinatura || {};

    const statusMap = {
        ativo: { color: "success", icon: <CheckCircleOutline fontSize="small" />, label: "Ativo" },
        trial: { color: "info", icon: <Schedule fontSize="small" />, label: "Teste Grátis" },
        pendente: { color: "warning", icon: <InfoOutlined fontSize="small" />, label: "Pendente" },
        cancelado: { color: "error", icon: <CancelOutlined fontSize="small" />, label: "Cancelado" },
    };

    const getStatusStyle = (status) => statusMap[status] || { color: "default", label: status || "—" };

    const handleSave = async () => {
        if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
            setErro("Email inválido");
            return;
        }


        if (formData.mobilePhone && !formData.mobilePhone.match(/^\d{10,11}$/)) {
            setErro("Telefone inválido");
            return;
        }

        try {
            setSaving(true);
            const token = await user.getIdToken();

            await axios.put(`${APIURL}/update-store-data`, {
                idLoja,
                asaasCustomerId: assinatura.asaasCustomerId,
                email: formData.email,
                mobilePhone: formData.mobilePhone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOpen(false);
            window.location.reload();
        } catch (err) {
            setErro("Erro ao salvar dados de faturamento.");
        } finally {
            setSaving(false);
        }
    };

    const handleAction = async (actionFn) => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            await actionFn(token);
            window.location.reload();
        } catch (err) {
            setErro("Não foi possível completar a ação. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const retryCobranca = () => handleAction((token) => {
        if (!loja.cobranca) {
            setErro("Dados de cobrança não encontrados. Atualize antes.");
            return Promise.reject();
        }

        return axios.post(
            `${APIURL}/retry-subscription`,
            { idLoja, cobranca: loja.cobranca },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    });

    const cancelar = () => {
        if (window.confirm("Tem certeza que deseja cancelar sua assinatura?")) {
            handleAction((token) =>
                axios.delete(`${APIURL}/cancel-subscription/${assinatura.asaasSubscriptionId}`, { headers: { Authorization: `Bearer ${token}` } })
            );
        }
    };

    const formatarData = (date) => {
        if (!date) return "—";

        if (date.seconds) {
            return new Date(date.seconds * 1000).toLocaleDateString('pt-BR');
        }

        return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, margin: "0 auto" }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>

                {/* CABEÇALHO COM NOME DA LOJA */}
                <Box mb={4}>
                    <Typography variant="h5" fontWeight="700">{loja.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">ID: {idLoja}</Typography>
                </Box>

                {/* Dados */}
                <Box sx={{ bgcolor: "action.hover", p: 3, borderRadius: 2, mb: 3 }}>
                    <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                            <Chip
                                icon={getStatusStyle(assinatura.status).icon}
                                label={getStatusStyle(assinatura.status).label}
                                color={getStatusStyle(assinatura.status).color}
                                size="small"
                            />
                        </Box>

                        {/* DATA DE VENCIMENTO / RENOVAÇÃO */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">Próximo Vencimento</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarMonth sx={{ fontSize: 18, color: 'action.active' }} />
                                <Typography variant="body2" fontWeight="600">
                                    {formatarData(assinatura.nextDueDate)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2" color="text.secondary">Pagamento</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                                {assinatura.statusPagamento || "—"}
                            </Typography>
                        </Box>

                        <Divider />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Plano Atual</Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                                {assinatura.plano || "—"}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* ALERTAS */}
                {assinatura.requiresAction && (
                    <Alert severity="warning" sx={{ mb: 2 }}>Sua assinatura requer atenção para evitar bloqueio.</Alert>
                )}

                <Alert severity="info" icon={<InfoOutlined />} sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Precisa alterar e-mail ou telefone de cobrança?</Typography>
                        <Button size="small" onClick={() => setOpen(true)} sx={{ fontWeight: 'bold' }}>Editar</Button>
                    </Box>
                </Alert>


                {/* BOTÕES DE AÇÃO */}
                <Stack spacing={2} mt={2}>

                    {erro && <Alert severity="error">{erro}</Alert>}

                    <Button
                        disabled={!assinatura.lastInvoiceUrl}
                        title={!assinatura.lastInvoiceUrl ? "Nenhuma fatura disponível" : ""}
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => window.open(assinatura.lastInvoiceUrl, "_blank")}
                    >
                        Pagar Fatura Pendente
                    </Button>

                    {(assinatura.requiresAction || assinatura.statusPagamento === "atrasado") && (
                        <Button variant="contained" fullWidth size="large" onClick={retryCobranca}>
                            Regularizar Assinatura
                        </Button>
                    )}

                    {/* BOTÃO DE CANCELAMENTO */}
                    {assinatura.status !== "cancelado" && (
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={cancelar}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <CancelOutlined />}
                        >
                            Cancelar Assinatura
                        </Button>
                    )}

                </Stack>
            </Paper>

            {/* MODAL DE EDIÇÃO */}
            <Dialog
                open={open}
                onClose={() => {
                    if (!saving) {
                        setOpen(false)
                        setErro("");
                    }
                }}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Dados de Faturamento</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="E-mail de Cobrança"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => {
                                setErro("");
                                setFormData({ ...formData, email: e.target.value });
                            }}
                            InputProps={{ startAdornment: <EmailOutlined sx={{ mr: 1, color: 'action.active' }} /> }}
                        />
                        <TextField
                            label="WhatsApp"
                            fullWidth
                            value={formData.mobilePhone}
                            onChange={(e) => {
                                setErro("");
                                setFormData({ ...formData, mobilePhone: e.target.value });
                            }}
                            InputProps={{ startAdornment: <WhatsApp sx={{ mr: 1, color: 'action.active' }} /> }}
                        />

                        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                            <Typography variant="caption" color="error.main" fontWeight="bold" display="block">
                                ALTERAÇÃO DE CPF/CNPJ
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Por questões de segurança, a alteração do documento titular deve ser solicitada diretamente ao suporte.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
