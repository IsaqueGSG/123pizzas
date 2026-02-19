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

import CampoEnderecoGoogle from "../CampoEnderecoGoogle";
import { useEntrega } from "../../contexts/EntregaContext";

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

const clienteIcon = L.divIcon({
    html: `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#1976d2">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const lojaIcon = L.divIcon({
    html: `
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="#d32f2f"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 4h18l-1.5 5H4.5L3 4z" fill="#f44336"/>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <rect x="10" y="12" width="4" height="8" fill="#ffffff"/>
      <rect x="6" y="12" width="3" height="3" fill="#ffffff"/>
      <rect x="15" y="12" width="3" height="3" fill="#ffffff"/>
    </svg>
  `,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
});

export default function MapaEntrega() {
    const { endereco, rota, atualizarCampo, calcularEntrega, enderecoLoja } = useEntrega();

    function AjustarZoom({ rota }) {
        const map = useMap();

        useEffect(() => {
            if (!rota || rota.length === 0) return;

            const bounds = rota.map(p => [p.lat, p.lng]);
            map.fitBounds(bounds, { padding: [40, 40] });
        }, [rota, map]);

        return null;
    }

    const temRota = Array.isArray(rota) && rota.length > 0;
    const temCoordenadasCliente = endereco.lat && endereco.lng;

    return (
        <>
            <Typography fontWeight="bold">
                Endereço de entrega
            </Typography>

            {/* GRID CORRIGIDO */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 120px" },
                    gap: 1,
                    mt: 1
                }}
            >
                <CampoEnderecoGoogle />

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
                    multiline
                    sx={{ gridColumn: { md: "1 / span 2" } }}
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

            {temRota && temCoordenadasCliente && (
                <>
                    <Typography sx={{ mt: 1 }}>
                        {endereco.enderecoFormatado || "Endereço selecionado"}
                        {" "}📏 {(endereco.distanciaKm ?? 0).toFixed(2)} km —
                        {" "}💰 R$ {(endereco.taxaEntrega ?? 0).toFixed(2)}
                    </Typography>

                    <Box sx={{ height: 280, mt: 1, borderRadius: 2, overflow: "hidden" }}>
                        <MapContainer
                            center={[endereco.lat, endereco.lng]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {enderecoLoja?.lat && enderecoLoja?.lng && (
                                <Marker
                                    position={[enderecoLoja.lat, enderecoLoja.lng]}
                                    icon={lojaIcon}
                                />
                            )}

                            <Marker
                                position={[endereco.lat, endereco.lng]}
                                icon={clienteIcon}
                            />

                            <Polyline positions={rota.map(p => [p.lat, p.lng])} />

                            <AjustarZoom rota={rota} />
                        </MapContainer>
                    </Box>
                </>
            )}
        </>
    );
}
