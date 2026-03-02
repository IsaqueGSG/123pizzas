import { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    IconButton
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
    MapContainer,
    TileLayer,
    FeatureGroup,
    Polygon,
    Marker,
    Tooltip
} from "react-leaflet";

import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { usePreferencias } from "../../contexts/PreferenciasContext";
import { useLoja } from "../../contexts/LojaContext";

// Fix ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function AdminZonasEntrega() {
    const { preferencias, atualizarPreferencias } = usePreferencias();
    const { idLoja } = useLoja();

    const enderecoLoja = preferencias?.enderecoLoja;
    const featureGroupRef = useRef(null);

    const [zonas, setZonas] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [coordsTemp, setCoordsTemp] = useState([]);

    const [formZona, setFormZona] = useState({
        nome: "",
        valor: "",
        ativo: true
    });

    useEffect(() => {
        setZonas(preferencias?.zonasEntrega || []);
    }, [preferencias]);

    // 🔥 CRIAR NOVO POLÍGONO
    function handleCreated(e) {
        const layer = e.layer;

        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0];

            const coords = latlngs.map(p => ({
                lat: p.lat,
                lng: p.lng
            }));

            setCoordsTemp(coords);
            setDialogOpen(true);
        }
    }

    // ✏️ EDITAR POLÍGONO (arrastar vértices)
    async function handleEdited(e) {
        const layers = e.layers;
        const novasZonas = [...zonas];

        layers.eachLayer(layer => {
            const zonaId = layer.options.zonaId;
            if (!zonaId) return;

            const latlngs = layer.getLatLngs()[0];
            const novasCoords = latlngs.map(p => ({
                lat: p.lat,
                lng: p.lng
            }));

            const index = novasZonas.findIndex(z => z.id === zonaId);
            if (index !== -1) {
                novasZonas[index] = {
                    ...novasZonas[index],
                    coordenadas: novasCoords
                };
            }
        });

        await atualizarPreferencias({
            zonasEntrega: novasZonas
        });

        setZonas(novasZonas);
    }

    // 🗑️ EXCLUIR POLÍGONO PELO MAPA
    async function handleDeleted(e) {
        const layers = e.layers;
        let novasZonas = [...zonas];

        layers.eachLayer(layer => {
            const zonaId = layer.options.zonaId;
            if (!zonaId) return;

            novasZonas = novasZonas.filter(z => z.id !== zonaId);
        });

        await atualizarPreferencias({
            zonasEntrega: novasZonas
        });

        setZonas(novasZonas);
    }

    async function salvarZona() {
        if (coordsTemp.length < 3 || !formZona.valor) return;

        const novaZona = {
            id: crypto.randomUUID(),
            nome: formZona.nome || "Zona de entrega",
            valor: Number(formZona.valor),
            coordenadas: coordsTemp,
            ativo: formZona.ativo
        };

        const novasZonas = [...zonas, novaZona];

        await atualizarPreferencias({
            zonasEntrega: novasZonas
        });

        setZonas(novasZonas);
        resetDialog();
    }

    async function removerZona(id) {
        const novasZonas = zonas.filter(z => z.id !== id);

        await atualizarPreferencias({
            zonasEntrega: novasZonas
        });

        setZonas(novasZonas);
    }

    async function toggleZona(id) {
        const novasZonas = zonas.map(z =>
            z.id === id ? { ...z, ativo: !z.ativo } : z
        );
        
        await atualizarPreferencias({
            zonasEntrega: novasZonas
        });

        setZonas(novasZonas);
    }

    function resetDialog() {
        setDialogOpen(false);
        setCoordsTemp([]);
        setFormZona({
            nome: "",
            valor: "",
            ativo: true
        });
    }

    if (!enderecoLoja?.lat || !enderecoLoja?.lng) {
        return (
            <Typography color="error">
                Configure o endereço da loja nas preferências primeiro.
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" mb={1}>
                Zonas de Entrega (por região)
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
                Desenhe, edite ou exclua regiões diretamente no mapa.
            </Typography>

            <Box
                sx={{
                    height: 500,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    mb: 2
                }}
            >
                <MapContainer
                    center={[enderecoLoja.lat, enderecoLoja.lng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker position={[enderecoLoja.lat, enderecoLoja.lng]}>
                        <Tooltip>Local da loja</Tooltip>
                    </Marker>

                    {/* 🔥 MUITO IMPORTANTE: polígonos dentro do FeatureGroup */}
                    <FeatureGroup ref={featureGroupRef}>
                        {zonas.map(zona => (
                            zona.ativo && (
                                <Polygon
                                    key={zona.id}
                                    positions={zona.coordenadas.map(c => [c.lat, c.lng])}
                                    pathOptions={{
                                        color: "#1976d2",
                                        fillOpacity: 0.3
                                    }}
                                    eventHandlers={{
                                        add: (e) => {
                                            e.target.options.zonaId = zona.id;
                                        }
                                    }}
                                >
                                    <Tooltip sticky>
                                        {zona.nome} — R$ {zona.valor}
                                    </Tooltip>
                                </Polygon>
                            )
                        ))}
                        <EditControl
                            position="topright"
                            onCreated={handleCreated}
                            onEdited={handleEdited}
                            onDeleted={handleDeleted}
                            draw={{
                                rectangle: false,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                                polygon: {
                                    allowIntersection: false,
                                    showArea: false,
                                },
                            }}
                            edit={{
                                edit: {
                                    selectedPathOptions: {
                                        maintainColor: true,
                                        opacity: 0.6,
                                    },
                                },
                                remove: true,
                            }}
                        />
                    </FeatureGroup>
                </MapContainer>
            </Box>

            {/* LISTA DE ZONAS (mantém integração com AdminPreferencias) */}
            {
                zonas.map(zona => (
                    <Card key={zona.id} sx={{ mb: 1 }}>
                        <CardContent
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <Box>
                                <Typography fontWeight="bold">
                                    {zona.nome}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Taxa: R$ {zona.valor}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={zona.ativo}
                                            onChange={() => toggleZona(zona.id)}
                                        />
                                    }
                                    label="Ativa"
                                />

                                <IconButton
                                    color="error"
                                    onClick={() => removerZona(zona.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            }

            <Dialog open={dialogOpen} onClose={resetDialog}>
                <DialogTitle>Nova Zona de Entrega</DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="Nome da zona"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={formZona.nome}
                        onChange={e =>
                            setFormZona(prev => ({ ...prev, nome: e.target.value }))
                        }
                    />

                    <TextField
                        label="Valor da taxa (R$)"
                        type="number"
                        fullWidth
                        size="small"
                        value={formZona.valor}
                        onChange={e =>
                            setFormZona(prev => ({ ...prev, valor: e.target.value }))
                        }
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formZona.ativo}
                                onChange={e =>
                                    setFormZona(prev => ({
                                        ...prev,
                                        ativo: e.target.checked
                                    }))
                                }
                            />
                        }
                        label="Zona ativa"
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={resetDialog}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarZona}>
                        Salvar Zona
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}