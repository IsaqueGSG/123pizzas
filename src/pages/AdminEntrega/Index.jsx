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
import AdminZonasEntrega from "../../components/AdminZonasEntregas";

import { buscarCep, geocodeGoogle } from "../../services/entrega.service";
import { usePreferencias } from "../../contexts/PreferenciasContext";


export default function AdminEntrega() {
    const { preferencias, atualizarPreferencias, loading } = usePreferencias();
    console.log("preferencias do contexto: ", preferencias);
    const [prefs, setPrefs] = useState(preferencias);

    const [cepLoja, setCepLoja] = useState("");
    const [cepData, setCepData] = useState(null);

    const [enderecoLoja, setEnderecoLoja] = useState("");
    const [numeroLoja, setNumeroLoja] = useState("");
    const [loadingEndereco, setLoadingEndereco] = useState(false);
    const [erroEndereco, setErroEndereco] = useState("");

    useEffect(() => {
        setPrefs(preferencias);

        if (preferencias?.enderecoLoja) {
            setCepLoja(preferencias.enderecoLoja.cep || "");
            setNumeroLoja(preferencias.enderecoLoja.numero || "");
        }
    }, [preferencias]);

    async function buscarEndereco() {
        try {
            if (!cepLoja || !numeroLoja) {
                setErroEndereco("Informe CEP e número");
                return;
            }

            setLoadingEndereco(true);
            setErroEndereco("");

            const cepData = await buscarCep(cepLoja);
            setCepData(cepData);

            const enderecoTexto = `${cepData.logradouro}, ${numeroLoja} - ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}, ${cepData.cep}`;
            setEnderecoLoja(enderecoTexto);

            const key = import.meta.env.VITE_GOOGLE_GEO_API_KEY;
            let geo;

            try {
                geo = await geocodeGoogle(key, enderecoTexto);
            } catch {
                geo = await geocodeGoogle(key, `${cepData.cep}, Brasil`);
            }

            const enderecoLoja = {
                enderecoCompleto: enderecoTexto,
                cep: cepData.cep,
                numero: numeroLoja,
                rua: cepData.logradouro,
                bairro: cepData.bairro,
                cidade: cepData.localidade,
                uf: cepData.uf,
                lat: geo.lat,
                lng: geo.lng
            };

            setPrefs(prev => ({
                ...prev,
                enderecoLoja
            }));

            setErroEndereco("");
        } catch (err) {
            setErroEndereco(err.message);
        } finally {
            setLoadingEndereco(false);
        }
    }

    const guardarPreferencias = async () => {
        await atualizarPreferencias(prefs);
        console.log("preferencias salvas: ", prefs);
        alert("Preferências salvas com sucesso!");
    };

    const houveMudanca = useMemo(() => {
        return (JSON.stringify(prefs) !== JSON.stringify(preferencias));
    }, [prefs, preferencias]);



    if (
        loading ||
        cepLoja === ""
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

            {/* ENDEREÇO */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography fontWeight="bold" gutterBottom>
                    📍 Endereço da loja
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 1,
                        mt: 1
                    }}
                >
                    <TextField
                        label="CEP"
                        size="small"
                        value={cepLoja}
                        onChange={e => setCepLoja(e.target.value)}
                    />

                    <TextField
                        label="Número"
                        size="small"
                        value={numeroLoja}
                        onChange={e => setNumeroLoja(e.target.value)}
                    />

                    <Button
                        variant="outlined"
                        disabled={loadingEndereco || !cepLoja || !numeroLoja}
                        onClick={buscarEndereco}
                    >
                        {loadingEndereco ? <CircularProgress size={20} /> : "Buscar"}
                    </Button>

                    {prefs.enderecoLoja?.lat && (
                        <Card
                            variant="outlined"
                            sx={{ gridColumn: "1 / -1", mt: 2, p: 2, bgcolor: "#f9f9f9" }}
                        >
                            <Typography fontWeight="bold">
                                Endereço confirmado
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {prefs.enderecoLoja.enderecoCompleto}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Lat: {prefs.enderecoLoja.lat} | Lng:{" "}
                                {prefs.enderecoLoja.lng}
                            </Typography>
                        </Card>
                    )}

                    {erroEndereco && (
                        <Typography color="error">{erroEndereco}</Typography>
                    )}
                </Box>
            </Card>

            {/* TAXA */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography fontWeight="bold" gutterBottom>
                    💰 Taxa de entrega
                </Typography>

                <AdminZonasEntrega />

                <Typography sx={{ my: 2 }} fontWeight="bold" gutterBottom>
                    Entrega por KM
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        label="Taxa de entrega minima"
                        type="number"
                        size="small"
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                        }}
                        value={prefs.taxaEntregaMinima}
                        onChange={e =>
                            setPrefs(prev => ({
                                ...prev,
                                taxaEntregaMinima: Math.max(0, Number(e.target.value) || 0)
                            }))
                        }
                    />

                    <TextField
                        fullWidth
                        label="Valor por km"
                        type="number"
                        size="small"
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                        }}
                        value={prefs.taxaEntregaKm}
                        onChange={e =>
                            setPrefs(prev => ({
                                ...prev,
                                taxaEntregaKm: Math.max(0, Number(e.target.value) || 0)
                            }))
                        }
                    />
                </Box>
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
