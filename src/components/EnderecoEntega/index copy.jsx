import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, } from "react";

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
      <!-- Toldo -->
      <path d="M3 4h18l-1.5 5H4.5L3 4z" fill="#f44336"/>
      
      <!-- Corpo da loja -->
      <rect x="4" y="9" width="16" height="11" rx="1.5" />

      <!-- Porta -->
      <rect x="10" y="12" width="4" height="8" fill="#ffffff"/>

      <!-- Janela esquerda -->
      <rect x="6" y="12" width="3" height="3" fill="#ffffff"/>

      <!-- Janela direita -->
      <rect x="15" y="12" width="3" height="3" fill="#ffffff"/>
    </svg>
  `,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
});

import { useEntrega } from "../../contexts/EntregaContext";

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
                    disabled={endereco.loading}
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
            </Button >


            {
                endereco.loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )
            }

            {
                endereco.erro && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {endereco.erro}
                    </Typography>
                )
            }

            {
                rota.length > 0 && endereco.lat && endereco.lng && (
                    <>
                        <Typography sx={{ mt: 1 }}>
                            {(endereco.rua && endereco.bairro && endereco.cidade && endereco.uf)
                                ? `${endereco.rua} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf} `
                                : "Localização atual "
                            }
                            📏 {(endereco.distanciaKm ?? 0).toFixed(2)} km —
                            💰 R$ {(endereco.taxaEntrega ?? 0).toFixed(2)}

                        </Typography>

                        <Box sx={{ height: 280, mt: 1 }}>
                            <MapContainer
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                {/* Marker para o endereço da loja */}
                                {enderecoLoja?.lat && enderecoLoja?.lng && (
                                    <Marker position={[enderecoLoja.lat, enderecoLoja.lng]} icon={lojaIcon} />
                                )}

                                {/* Marker para o endereço do cliente */}
                                {endereco.lat && endereco.lng && (
                                    <Marker position={[endereco.lat, endereco.lng]} icon={clienteIcon} />
                                )}

                                {Array.isArray(rota) && rota.length > 0 && (
                                    <Polyline positions={rota.map(p => [p.lat, p.lng])} />
                                )}

                                <AjustarZoom rota={rota} />
                            </MapContainer>

                        </Box>
                    </>
                )
            }
        </>
    );
}
