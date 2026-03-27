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
    setDoc,
    getDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";

export default function ConfirmarCriacao() {
    const batch = writeBatch(db);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const [openSucesso, setOpenSucesso] = useState(false);

    // 🔎 Carrega dados do cadastro
    useEffect(() => {
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
    }, [user, navigate]);

    // 🚀 Criar loja de verdade
    const criarLoja = async () => {
        setErro("");
        setLoading(true);

        try {
            const { loja, cobranca } = dados;
            const slug = loja.slug;

            const lojaRef = doc(db, "clientes123pedidos", slug);

            const snap = await getDoc(lojaRef);

            if (snap.exists()) {
                setErro("Já existe uma loja com esse endereço");
                setLoading(false);
                return;
            }

            // 🔥 CRIA BATCH AQUI (dentro da função)
            const batch = writeBatch(db);

            const emailId = user.email.toLowerCase();

            const userRef = doc(
                db,
                "clientes123pedidos",
                slug,
                "usuarios",
                emailId
            );

            // 🏪 Loja
            batch.set(lojaRef, {
                nome: loja.nomeLoja,
                telefone: loja.telefone,
                cobranca,
                assinatura: {
                    status: "trial",
                    plano: "basico",
                    trialEndsAt: Timestamp.fromDate(
                        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                    )
                },
                createdAt: serverTimestamp()
            });

            // 👤 Usuário
            batch.set(userRef, {
                role: "admin",
                isOwner: true,
                createdAt: serverTimestamp()
            });

            // 🔥 EXECUTA TUDO JUNTO
            await batch.commit();

            // 🧹 Limpa
            sessionStorage.removeItem("registroSaaS");
            sessionStorage.removeItem("modoRegistro");

            localStorage.setItem("idLoja", slug);

            window.location.href = `/${slug}/admin/pedidos`;

        } catch (err) {
            console.error(err);
            setErro("Erro ao criar loja");
            setLoading(false);
        }
    };

    if (!dados) {
        return (
            <Box sx={{ p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const { loja, cobranca } = dados;

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
                            window.location.href = "/login";
                        }}
                    >
                        Acessar minha loja
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}