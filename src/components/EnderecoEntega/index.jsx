import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// FIX ÍCONE LEAFLET
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import { useEntrega } from "../../contexts/EntregaContext";

const ENDERECO_LOJA = {
    lat: -23.460380170938265,
    lng: -46.41701184232687
};

export default function MapaEntrega() {
    const { endereco, rota, atualizarCampo, calcularEntrega } = useEntrega();

    function AjustarZoom({ rota }) {
        const map = useMap();

        useEffect(() => {
            if (!rota || rota.length === 0) return;

            const bounds = rota.map(p => [p.lat, p.lng]);
            map.fitBounds(bounds, { padding: [40, 40] });
        }, [rota, map]);

        return null;
    }

    return (
        <>
            <Typography fontWeight="bold">Endereço de entrega</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 1 }}>
                <TextField
                    label="CEP"
                    fullWidth
                    size="small"
                    value={endereco.cep}
                    onChange={e => atualizarCampo("cep", e.target.value)}
                />

                <TextField
                    label="Número"
                    fullWidth
                    size="small"
                    value={endereco.numero}
                    onChange={e => atualizarCampo("numero", e.target.value)}
                />

                <TextField
                    label="Observação"
                    fullWidth
                    size="small"
                    rows={2}
                    sx={{ gridColumn: "1 / span 2" }}
                    value={endereco.observacao}
                    onChange={e => atualizarCampo("observacao", e.target.value)}
                />
            </Box>

            <Button
                sx={{ mt: 1 }}
                variant="contained"
                fullWidth
                onClick={calcularEntrega}
                disabled={endereco.loading}
            >
                Calcular taxa
            </Button>

            {endereco.loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {endereco.erro && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {endereco.erro}
                </Typography>
            )}

            {rota.length > 0 && (
                <>
                    <Typography sx={{ mt: 1 }}>
                        {endereco.rua} - {endereco.bairro}, {endereco.cidade}/{endereco.uf} 📏 {endereco.distanciaKm.toFixed(2)} km — 💰 R$ {endereco.taxaEntrega.toFixed(2)}
                    </Typography>

                    <Box sx={{ height: 280, mt: 1 }}>
                        <MapContainer
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            <Marker position={[ENDERECO_LOJA.lat, ENDERECO_LOJA.lng]} />
                            <Marker position={[endereco.lat, endereco.lng]} />

                            <Polyline positions={rota.map(p => [p.lat, p.lng])} />

                            <AjustarZoom rota={rota} />
                        </MapContainer>

                    </Box>
                </>
            )}
        </>
    );
}
