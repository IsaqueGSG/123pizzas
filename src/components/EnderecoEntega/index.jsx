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
import { useRef, useEffect, useState, useMemo } from "react";

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
    const { endereco, rota, atualizarCampo, calcularEntrega, enderecoLoja, setSessionToken } = useEntrega();

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
    const temCoordenadasCliente =
        endereco.lat !== null && endereco.lng !== null;


    //campo endereço de entrega google autocomplete + número + observação
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const sessionTokenRef = useRef(null);

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google?.maps?.places && inputRef.current) {
                clearInterval(interval);

                sessionTokenRef.current =
                    new window.google.maps.places.AutocompleteSessionToken();

                autocompleteRef.current =
                    new window.google.maps.places.Autocomplete(inputRef.current, {
                        componentRestrictions: { country: "br" },
                        fields: [
                            "place_id",
                            "formatted_address",
                            "geometry",
                            "address_components"
                        ],
                        types: ["address"],
                    });

                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current.getPlace();

                    if (!place.geometry) return;

                    const components = place.address_components || [];

                    const getComponent = (type) => {
                        const component = components.find(c =>
                            c.types.includes(type)
                        );

                        return component?.long_name || "";
                    };

                    const rua = getComponent("route");

                    const bairro =
                        getComponent("sublocality_level_1") ||
                        getComponent("sublocality") ||
                        getComponent("neighborhood");

                    const cidade =
                        getComponent("administrative_area_level_2");

                    const uf =
                        getComponent("administrative_area_level_1");

                    const cep =
                        getComponent("postal_code");

                    atualizarCampo("placeId", place.place_id || "");
                    atualizarCampo(
                        "enderecoFormatado",
                        place.formatted_address || ""
                    );

                    atualizarCampo("rua", rua);
                    atualizarCampo("bairro", bairro);
                    atualizarCampo("cidade", cidade);
                    atualizarCampo("uf", uf);
                    atualizarCampo("cep", cep);

                    atualizarCampo(
                        "lat",
                        place.geometry.location.lat()
                    );

                    atualizarCampo(
                        "lng",
                        place.geometry.location.lng()
                    );

                    setSessionToken(sessionTokenRef.current);

                    sessionTokenRef.current =
                        new window.google.maps.places.AutocompleteSessionToken();
                });

                setLoaded(true);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const temCoordenadas =
            endereco.lat !== null &&
            endereco.lng !== null &&
            endereco.lat !== undefined &&
            endereco.lng !== undefined;

        const temPlaceId =
            Boolean(endereco.placeId);

        if (temCoordenadas && temPlaceId) {
            calcularEntrega({
                ...endereco
            });
        }
    }, [
        endereco.lat,
        endereco.lng,
        endereco.placeId
    ]);

    // Sincroniza o input físico com o endereço do contexto (útil para preenchimento automático pelo telefone)
    useEffect(() => {
        if (inputRef.current && endereco?.enderecoFormatado) {
            inputRef.current.value = endereco.enderecoFormatado;
        } else if (inputRef.current && !endereco?.placeId) {
            inputRef.current.value = ""; // Limpa se o endereço for resetado
        }
    }, [endereco?.enderecoFormatado, endereco?.placeId]);

    const polyline = useMemo(
        () => Array.isArray(rota) ? rota.map(p => [p.lat, p.lng]) : [],
        [rota]
    );


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
                <TextField
                    label="Endereço de entrega"
                    fullWidth
                    size="small"
                    inputRef={inputRef}
                    placeholder="Digite seu endereço (Rua, número, bairro)"
                    InputProps={{
                        endAdornment: !loaded ? <CircularProgress size={20} /> : null,
                    }}
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
                    multiline
                    sx={{ gridColumn: { md: "1 / span 2" } }}
                    value={endereco.observacao}
                    onChange={e => atualizarCampo("observacao", e.target.value)}
                />
            </Box>

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

                            <Polyline positions={polyline} />

                            <AjustarZoom rota={rota} />
                        </MapContainer>
                    </Box>
                </>
            )}
        </>
    );
}
