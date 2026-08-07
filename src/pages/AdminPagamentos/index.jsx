import { useEffect, useState, useMemo } from "react";
import {
    Box, Typography, Card, TextField, Button, CircularProgress,
    IconButton, Divider, Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AdminDrawer from "../../components/AdminDrawer";
import { usePreferencias } from "../../contexts/PreferenciasContext";

export default function AdminPagamentos() {
    const { preferencias, atualizarPreferencias, loading } = usePreferencias();
    // Inicializa com array, se não existir, cria vazio
    const [pagamentos, setPagamentos] = useState(preferencias?.pagamentos || []);

    useEffect(() => {
        setPagamentos(preferencias?.pagamentos || []);
    }, [preferencias]);

    const atualizarItem = (index, campo, valor) => {
        const novos = [...pagamentos];
        novos[index][campo] = valor;
        setPagamentos(novos);
    };

    const adicionarPagamento = () => {
        setPagamentos([...pagamentos, { id: Date.now(), nome: "", obs: "" }]);
    };

    const removerPagamento = (index) => {
        setPagamentos(pagamentos.filter((_, i) => i !== index));
    };

    const guardarPreferencias = async () => {
        await atualizarPreferencias({ ...preferencias, pagamentos });
        alert("Configurações salvas!");
    };

    const houveMudanca = useMemo(() => {
        return (JSON.stringify(pagamentos) !== JSON.stringify(preferencias?.pagamentos || []));
    }, [pagamentos, preferencias]);

    if (loading) return <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <AdminDrawer />

            <Typography variant="h6" sx={{ mb: 2 }}>💳 Configurar Formas de Pagamento</Typography>

            <Stack spacing={2}>
                {pagamentos.map((pag, index) => (
                    <Card key={pag.id || index} variant="outlined" sx={{ p: 2, position: 'relative' }}>


                        <Box sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1.5
                        }}>
                            <TextField
                                fullWidth
                                label="Nome da forma de pagamento"
                                size="small"
                                value={pag.nome}
                                onChange={(e) => atualizarItem(index, "nome", e.target.value)}
                            />
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => removerPagamento(index)}
                                sx={{ m: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>


                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Observações / Instruções"
                            size="small"
                            placeholder="Ex: Chave PIX, ou 'Informe a bandeira do VR'"
                            value={pag.obs}
                            onChange={(e) => atualizarItem(index, "obs", e.target.value)}
                        />
                    </Card>
                ))}
            </Stack>

            <Button
                startIcon={<AddIcon />}
                onClick={adicionarPagamento}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            >
                Adicionar
            </Button>

            {/* BOTÃO SALVAR */}
            <Box sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", p: 2, bgcolor: "background.paper", boxShadow: "0 -2px 10px rgba(0,0,0,.1)" }}>
                <Button fullWidth variant="contained" disabled={!houveMudanca} onClick={guardarPreferencias}>
                    Salvar Formas de Pagamento
                </Button>
            </Box>
        </Box>
    );
}