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
import PrintIcon from '@mui/icons-material/Print';

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { imprimir, geraComandaHTML } from "../../services/impressora.service";
import { usePreferencias } from "../../contexts/PreferenciasContext";


export default function AdminImpressora() {
    const { preferencias, atualizarPreferencias, loading } = usePreferencias();
    // console.log("preferencias do contexto: ", preferencias);

    const [prefs, setPrefs] = useState(preferencias);
    const [printers, setPrinters] = useState([]);
    const [selecionada, setSelecionada] = useState(null);
    const [printerSalva, setPrinterSalva] = useState(null);
    const [isShared, setIsShared] = useState(true); // true por padrão para não mostrar erro inicial

    // Adicione este useEffect para validar sempre que a impressora mudar
    useEffect(() => {
        async function checkStatus() {
            if (selecionada && window.electronAPI) {
                const result = await window.electronAPI.verificarImpressoraCompartilhada(selecionada.name);
                // Assumindo que seu ipcMain retorna { success: true, isShared: boolean }
                setIsShared(result.isShared);
            }
        }
        checkStatus();
    }, [selecionada]);

    useEffect(() => {
        setPrefs(preferencias);
    }, [preferencias]);

    useEffect(() => {
        async function load() {
            if (!window.electronAPI) return;

            const lista = await window.electronAPI.listPrinters();
            setPrinters(lista);

            const salva = await window.electronAPI.getPrinter();

            if (salva) {
                setSelecionada(salva);
                setPrinterSalva(salva);
            }

            const larguraLocal = await window.electronAPI.getLargura();

            setPrefs(prev => ({
                ...prev,
                impressao: {
                    ...prev.impressao,
                    largura: larguraLocal
                }
            }));
        }

        load();
    }, []);

    const SalvarImpressora = async () => {
        if (!window.electronAPI) return;

        if (!isShared) {
            alert("⚠️ Esta impressora não está compartilhada no Windows. Verifique as propriedades.");
            return;
        }

        await window.electronAPI.setPrinter(selecionada);
        setPrinterSalva(selecionada);
        await atualizarPreferencias(prefs);
        alert("Impressora salva com sucesso!");
    }

    const houveMudanca = useMemo(() => {
        return (
            JSON.stringify(prefs) !== JSON.stringify(preferencias) ||
            (window.electronAPI && JSON.stringify(selecionada) !== JSON.stringify(printerSalva))
        );
    }, [prefs, preferencias, selecionada, printerSalva]);


    if (
        loading ||
        window.electronAPI && printers.length === 0
    ) {
        return (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, pb: 8 }}>

            <AdminDrawer />

            {/* IMPRESSÃO */}
            <Card
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 3
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Configurações de impressão
                    </Typography>

                    <Button
                        variant="contained"
                        endIcon={<PrintIcon />}
                        onClick={async () => {
                            try {
                                const now = Date.now();
                                const seconds = Math.floor(now / 1000);
                                const nanoseconds = (now % 1000) * 1e6;

                                const pedido = {
                                    id: "zYmtWFJiscslxVfsNtDZ",
                                    impresso: true,
                                    cliente: {
                                        nome: "teste",
                                        endereco: {
                                            lat: -23.4624581,
                                            observacao: "",
                                            taxaEntrega: 216.28,
                                            bairro: "Jardim Monte Alegre",
                                            lng: -46.4174645,
                                            loading: false,
                                            cep: "07273270",
                                            erro: "",
                                            rua: "Rua Jopiata",
                                            distanciaKm: 30.897,
                                            cidade: "Guarulhos",
                                            numero: "0",
                                            uf: "SP"
                                        },
                                        telefone: "11111111111",
                                        formaPagamento: {
                                            obsPagamento: "",
                                            forma: "PIX"
                                        }
                                    },
                                    itens: [
                                        {
                                            valor: 20,
                                            sabores: [],
                                            observacao: "",
                                            borda: null,
                                            quantidade: 1,
                                            extras: [],
                                            nome: "Acai 700ml"
                                        }
                                    ],
                                    createdAt: {
                                        type: "firestore/timestamp/1.0",
                                        seconds,
                                        nanoseconds
                                    },
                                    total: 236.28
                                };

                                const larguraImpressao =
                                    window.electronAPI
                                        ? await window.electronAPI.getLargura()
                                        : "80mm";

                                if (!window.electronAPI) {
                                    const html = geraComandaHTML(pedido, larguraImpressao);
                                    imprimir(html);
                                    return;
                                }

                                if (!selecionada) {
                                    alert("⚠️ Nenhuma impressora selecionada.");
                                    return;
                                }

                                if (!selecionada?.shareName) {
                                    alert("⚠️ Impressora inválida ou não compartilhada.");
                                    return;
                                }

                                const result =
                                    await window.electronAPI.imprimirPedido(
                                        pedido,
                                        larguraImpressao,
                                        null, // numero da comanda, não necessário para teste
                                        selecionada
                                    );

                                if (!result?.success) {
                                    alert(
                                        "❌ Falha ao imprimir.\n\n" +
                                        (result?.error || "Erro desconhecido.")
                                    );
                                    return;
                                }

                                alert("✅ Comanda enviada para impressora com sucesso.");

                            } catch (error) {
                                alert(
                                    "❌ Erro ao tentar imprimir.\n\n" +
                                    (error.message || error)
                                );
                            }
                        }}
                    >
                        Testar impressão
                    </Button>
                </Box>


                {/* largura papel */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        mb: 2
                    }}
                >
                    <Typography fontWeight="bold" sx={{ mb: 1 }}>
                        Largura do papel
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Ajusta o layout do cupom para a impressora térmica
                    </Typography>

                    <Select
                        fullWidth
                        size="small"
                        value={prefs.impressao?.largura || "80mm"}
                        onChange={async (e) => {
                            const largura = e.target.value;

                            // sempre atualizar UI
                            setPrefs(prev => ({
                                ...prev,
                                impressao: {
                                    ...prev.impressao,
                                    largura
                                }
                            }));

                            // salvar local no desktop
                            if (window.electronAPI) {
                                await window.electronAPI.setLargura(largura);
                            }
                        }}
                    >
                        <MenuItem value="58mm">58mm — cupom estreito</MenuItem>
                        <MenuItem value="80mm">80mm — cupom padrão</MenuItem>
                    </Select>
                </Box>

                {/* impressora */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50"
                    }}
                >
                    <Typography fontWeight="bold" sx={{ mb: 1 }}>
                        Impressora automática
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Usada para impressão silenciosa de pedidos
                    </Typography>

                    <Select
                        fullWidth
                        size="small"
                        disabled={!window.electronAPI}
                        value={selecionada ? JSON.stringify(selecionada) : ""}
                        onChange={(e) => {
                            const printer = JSON.parse(e.target.value);
                            setSelecionada(printer);
                        }}
                    >
                        {window.electronAPI ? (
                            printers.map(p => (
                                <MenuItem key={p.name} value={JSON.stringify(p)}>
                                    {p.displayName || p.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">
                                Disponível apenas no Desktop
                            </MenuItem>
                        )}
                    </Select>

                    {!window.electronAPI && (
                        <Typography
                            variant="caption"
                            color="warning.main"
                            sx={{ mt: 1, display: "block" }}
                        >
                            ⚠️ Seleção de impressora só funciona na versão desktop
                        </Typography>
                    )}

                    {selecionada && !isShared && (
                        <Alert
                            severity="warning"
                            sx={{
                                mt: 2,
                                "& .MuiAlert-message": {
                                    width: "100%"
                                }
                            }}
                        >
                            <Typography fontWeight="bold">
                                Impressora não compartilhada
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                                Para que a impressão automática funcione, compartilhe esta impressora no Windows.
                            </Typography>

                            <Typography variant="body2">
                                1. Clique em <b>Configurar compartilhamento</b>
                                <br />
                                2. Abra a aba <b>Compartilhamento</b>
                                <br />
                                3. Marque <b>Compartilhar esta impressora</b>
                                <br />
                                4. Clique em <b>Aplicar</b> e <b>OK</b>
                            </Typography>

                            <Button
                                sx={{ mt: 1.5 }}
                                variant="contained"
                                color="warning"
                                onClick={() =>
                                    window.electronAPI.openPrinterProperties(
                                        selecionada.name
                                    )
                                }
                            >
                                Configurar compartilhamento
                            </Button>
                        </Alert>
                    )}

                </Box>
            </Card >

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
                    onClick={SalvarImpressora}
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
