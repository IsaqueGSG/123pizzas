import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";
import { writeBatch } from "firebase/firestore";

import { db } from "../../config/firebase";
import {
    doc,
    collection,
    serverTimestamp,
    Timestamp,
    getDoc
} from "firebase/firestore";

export default function ConfirmarCriacao() {
    const { user, loading: loadingAuth } = useAuth();
    const navigate = useNavigate();

    const APIURL = import.meta.env.VITE_API_RENDER_ASAAS;

    const [loading, setLoading] = useState(false);
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState("");

    const [tentativas, setTentativas] = useState(0);
    const [openSucesso, setOpenSucesso] = useState(false);

    // 🔎 Carrega dados do cadastro
    useEffect(() => {
        if (loadingAuth) return; // ⛔ espera o Firebase

        if (!user) {
            navigate("/registro-saas");
            return;
        }

        const raw = sessionStorage.getItem("registroSaaS");

        if (!raw) {
            navigate("/registro-saas");
            return;
        }

        setDados(JSON.parse(raw));
    }, [user, loadingAuth, navigate]);

    if (loadingAuth || !dados) {
        return (
            <Box sx={{ p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const { loja, cobranca, plano } = dados;

    // 🚀 Criar loja de verdade
    const criarLoja = async () => {
        if (loading) return;

        setErro("");
        setLoading(true);

        try {

            const lojaRef = doc(db, "clientes123pedidos", loja.slug);
            const idLoja = loja.slug;

            const snap = await getDoc(lojaRef);

            if (snap.exists()) {
                setErro("Este link já está em uso");
                setLoading(false);
                return;
            }

            if (!/^[a-z0-9]{3,20}$/.test(loja.slug)) {
                setErro("Slug inválido");
                setLoading(false);
                return;
            }

            const userRef = doc(
                db,
                "clientes123pedidos",
                idLoja,
                "usuarios",
                user.email.toLowerCase()
            );

            // 🔥 batch
            const batch = writeBatch(db);

            batch.set(lojaRef, {
                id: idLoja,
                nome: loja.nomeLoja,
                slug: loja.slug,
                telefone: loja.telefone,
                cobranca,
                assinatura: {
                    status: "criando",
                    etapa: "firestore_ok",
                    plano: plano,
                    trialEndsAt: Timestamp.fromDate(
                        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                    )
                },

                createdAt: serverTimestamp()
            });

            batch.set(userRef, {
                role: "admin",
                isOwner: true,
                createdAt: serverTimestamp()
            });

            await batch.commit();

            localStorage.setItem("idLoja", idLoja);

            // 🔥 chama backend
            const token = await user.getIdToken();
            const res = await axios.post(APIURL + "/setup-subscription", {
                idLoja,
                cobranca
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 20000
            });


            if (res.data?.success || res.data?.already) {
                sessionStorage.removeItem("registroSaaS");
                sessionStorage.removeItem("modoRegistro");

                setLoading(false);
                setOpenSucesso(true);
                return;
            }

        } catch (err) {
            const mensagem =
                err.response?.data?.error ||
                err.response?.data?.errors?.[0]?.description ||
                err.message ||
                "Erro ao configurar assinatura.";

            if (err.response?.status === 409) {
                setErro("Estamos finalizando sua conta...");

                if (tentativas < 3) {
                    setTentativas(prev => prev + 1);

                    setTimeout(() => {
                        criarLoja();
                    }, 3000);
                }

                setLoading(false);
                return;
            }

            setErro(mensagem);
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Paper sx={{ p: 4, width: 500 }}>
                <Typography variant="h5" mb={2}>
                    Confirmar criação da conta
                </Typography>

                <Typography mb={2}>
                    Você está criando a loja com o email:
                    <br />
                    <strong>{user.email}</strong>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">🏪 Loja</Typography>

                <Typography>Nome: {loja.nomeLoja}</Typography>
                <Typography>Link: 123pedidos.web.app/{loja.slug}</Typography>
                <Typography>Telefone: {loja.telefone || "—"}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">💳 Cobrança</Typography>

                <Typography>Nome: {cobranca.nomeCobranca}</Typography>
                <Typography>CPF/CNPJ: {cobranca.cpfCnpj}</Typography>
                <Typography>Email: {cobranca.emailCobranca}</Typography>
                <Typography>Telefone: {cobranca.telefoneCobranca}</Typography>

                <Typography mt={2} fontSize={14}>
                    🎁 Você receberá 15 dias grátis
                </Typography>

                {erro && (
                    <Typography color="error" mt={2}>
                        {erro}
                    </Typography>
                )}


                <Button
                    fullWidth
                    disabled={loading}
                    variant="contained"
                    color="warning"
                    onClick={() => {
                        sessionStorage.removeItem("registroSaaS");
                        sessionStorage.removeItem("modoRegistro");
                        navigate("/registro-saas");
                    }}
                    sx={{ mt: 2 }}
                >
                    Recomeçar
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={criarLoja}
                    disabled={loading}
                    sx={{ mt: 3 }}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        "Criar minha loja"
                    )}
                </Button>


            </Paper>

            <Dialog open={openSucesso} disableEscapeKeyDown>
                <DialogTitle>🎉 Loja criada com sucesso!</DialogTitle>

                <DialogContent>
                    <Typography>
                        Parabéns! Sua loja foi criada e já está pronta para uso.
                    </Typography>

                    <Typography mt={2}>
                        Agora você pode acessar o painel administrativo.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => {
                            window.location.href = `/${loja.slug}/admin/pedidos`;
                        }}
                    >
                        Acessar minha loja
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}