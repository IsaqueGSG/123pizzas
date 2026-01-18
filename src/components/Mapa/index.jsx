import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Componentes do MUI
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    TextField,
} from '@mui/material';

// Ícones do MUI
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';

// --- CONFIGURAÇÃO DE ÍCONES DO LEAFLET (Essencial para React) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para mover a câmera do mapa
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 16);
    }, [center, map]);
    return null;
}

const MapaEntrega = ({ taxa, setTaxa, enderecoEntrega, setEnderecoEntrega }) => {
    // --- CONFIGURAÇÕES ---
    const LOJA_COORD = { lat: -23.4605278, lng: -46.4170333 }; // Sua loja
    const VALOR_KM = 5; // valor por km


    // --- ESTADOS ---
    const [posicaoCliente, setPosicaoCliente] = useState(LOJA_COORD);
    const [distancia, setDistancia] = useState(0);
    const [loading, setLoading] = useState(false); // Estado de carregamento para o botão
    const [status, setStatus] = useState("Ou arraste o marcador azul no mapa até o local exato da entrega.");
    const [numeroCasa, setNumeroCasa] = useState("");

    const markerRef = useRef(null);

    // --- FUNÇÃO DE CÁLCULO (OSRM) ---
    const calcularFrete = async (lat, lng) => {
        setLoading(true);

        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${LOJA_COORD.lng},${LOJA_COORD.lat};${lng},${lat}?overview=false`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.routes && data.routes[0]) {
                const distKm = data.routes[0].distance / 1000;
                const novaTaxa = distKm * VALOR_KM;

                const TaxaAredondadaParaCima = Math.ceil(novaTaxa)

                setDistancia(distKm);
                setTaxa(TaxaAredondadaParaCima);

                // 🔥 BUSCA ENDEREÇO EM TEXTO
                const endereco = await obterEnderecoPorCoordenadas(lat, lng);

                setEnderecoEntrega({
                    lat,
                    lng,
                    distancia: distKm,
                    taxa: TaxaAredondadaParaCima,
                    endereco: {
                        ...endereco,
                        numero: numeroCasa || endereco.numero
                    }
                });

            }
        } catch (error) {
            console.error("Erro ao calcular rota:", error);
            setStatus("Erro ao calcular a rota.");
        } finally {
            setLoading(false);
        }
    };


    // --- FUNÇÃO DE GPS ---
    const usarLocalizacaoAtual = () => {
        if (!navigator.geolocation) {
            alert("Geolocalização não suportada no seu navegador.");
            return;
        }
        setLoading(true);
        setStatus("Obtendo sua localização...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const novaPos = { lat: latitude, lng: longitude };
                setPosicaoCliente(novaPos);
                calcularFrete(latitude, longitude);
                setStatus("Localização encontrada! Ajuste o pino azul se necessário.");
            },
            (error) => {
                console.error(error);
                setLoading(false);
                setStatus("Não foi possível obter sua localização automática.");
                alert("Verifique se a permissão de localização está ativa.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // --- HANDLER PARA O ARRASTAR DO MARCADOR ---
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                const pos = marker.getLatLng();
                setPosicaoCliente(pos);
                calcularFrete(pos.lat, pos.lng);
                setStatus("Ponto de entrega atualizado.");
            }
        },
    }), [calcularFrete]);


    const obterEnderecoPorCoordenadas = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();

            if (!data.address) return null;

            const endereco = {
                rua: data.address.road || "",
                numero: data.address.house_number || "",
                bairro: data.address.suburb || data.address.neighbourhood || "",
                cidade: data.address.city || data.address.town || "",
                estado: data.address.state || "",
                cep: data.address.postcode || "",
                enderecoCompleto: data.display_name || ""
            };

            return endereco;
        } catch (err) {
            console.error("Erro ao buscar endereço:", err);
            return null;
        }
    };


    const criarMarker = (cor) =>
        L.divIcon({
            className: "",
            html: `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="${cor}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
      </svg>
    `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });


    useEffect(() => { //atualiza numero do endereco
        if (!enderecoEntrega) return;

        setEnderecoEntrega(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco,
                numero: numeroCasa
            }
        }));
    }, [numeroCasa]);


    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

            {/* Botão de GPS */}
            <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <MyLocationIcon />}
                onClick={usarLocalizacaoAtual}
                disabled={loading}
                sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: 2
                }}
            >
                {loading ? "Buscando localização..." : "Usar minha localização atual"}
            </Button>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr"
            }} >
                <TextField
                    disabled
                    fullWidth
                    value={
                        enderecoEntrega?.endereco
                            ? `${enderecoEntrega.endereco.rua} - ${enderecoEntrega.endereco.bairro}, ${enderecoEntrega.endereco.cidade}`
                            : "use a localização atual ou procure no mapa"
                    }
                />

                <TextField
                    fullWidth
                    label="Número"
                    value={numeroCasa}
                    onChange={(e) => setNumeroCasa(e.target.value)}
                />

            </Box>

            {/* Caixa de Status/Instruções */}
            <Box sx={{ bgcolor: '#fff8e1', p: 2, borderRadius: 2, borderLeft: '4px solid #ffc107', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MapIcon color="action" />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                    {status}
                </Typography>
            </Box>

            {/* Container do Mapa */}
            {/* Paper com variant="outlined" cria apenas uma borda sutil */}
            <Paper variant="outlined" sx={{ height: 350, width: '100%', borderRadius: 3, overflow: 'hidden', border: '2px solid #eee' }}>
                <MapContainer center={posicaoCliente} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={posicaoCliente} />

                    <Marker position={LOJA_COORD} icon={criarMarker("#e53935")}>
                        <Popup>📍 Nossa Loja</Popup>
                    </Marker>

                    <Marker
                        draggable
                        position={posicaoCliente}
                        icon={criarMarker("#1e88e5")}
                        ref={markerRef}
                        eventHandlers={eventHandlers}
                    >
                        <Popup>🏠 Local de Entrega</Popup>
                    </Marker>

                </MapContainer>
            </Paper>

            {/* Área de Resultados */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography fontWeight="bold">
                    Total da Entrega: R$ {taxa.toFixed(2)}
                </Typography>

                <Typography fontWeight="bold">
                    {distancia.toFixed(2)} km
                </Typography>
            </Box>

        </Box>
    );
};

export default MapaEntrega;