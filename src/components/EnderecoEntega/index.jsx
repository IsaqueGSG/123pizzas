import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Paper,
    Checkbox,
    FormControlLabel
} from "@mui/material";


import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const VITE_GOOGLE_GEO_API_KEY = import.meta.env.VITE_GOOGLE_GEO_API_KEY;

// endereço fixo da loja
// const ENDERECO_LOJA = "Rua Exemplo 123, Centro, São Paulo";
const ENDERECO_LOJA = { cep: "07273270", numero: 33, lat: -23.460380170938265, lng: -46.41701184232687 };

import { useMap } from "react-leaflet";

export default function MapaEntrega({
    taxa,
    setTaxa,
    enderecoEntrega,
    setEnderecoEntrega
}) {
    const [usarLocAtual, setUsarLocAtual] = useState(false);

    const [cep, setCep] = useState(enderecoEntrega?.endereco?.cep || "");
    const [numero, setNumero] = useState(enderecoEntrega?.endereco?.numero || "");
    const [observacao, setObservacao] = useState(enderecoEntrega?.endereco?.observacao || "");
    const [dadosCep, setDadosCep] = useState(null);

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const [origem, setOrigem] = useState(null);
    const [destino, setDestino] = useState(null);
    const [rota, setRota] = useState([]);
    const [distancia, setDistancia] = useState(null);

    async function buscarCep(cep) {
        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
            throw new Error("CEP inválido");
        }

        const res = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await res.json();

        if (data.erro) {
            throw new Error("CEP não encontrado");
        }

        return data;
    }

    function montarTentativasEndereco({
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep
    }) {
        return [
            `${logradouro}, ${numero} - ${bairro}, ${cidade} - ${uf}, Brasil`,
            `${logradouro} - ${bairro}, ${cidade} - ${uf}, Brasil`,
            `${cep}, ${cidade} - ${uf}, Brasil`
        ].filter(Boolean);
    }

    async function geocodeNominatim(query) {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "SistemaEntrega/1.0"
                }
            }
        );

        const data = await res.json();

        if (!data.length) throw new Error("Nominatim sem resultado");

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
    }

    async function geocodePhoton(query) {
        const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
        );

        const data = await res.json();

        if (!data.features?.length) throw new Error("Photon sem resultado");

        const [lng, lat] = data.features[0].geometry.coordinates;

        return { lat, lng };
    }

    async function geocodeGoogle(query) {
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${VITE_GOOGLE_GEO_API_KEY}`
        );

        const data = await res.json();

        if (data.status !== "OK") throw new Error("Google sem resultado");

        return data.results[0].geometry.location;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function geocodeComTentativasFallback(dadosEndereco) {
        const tentativas = montarTentativasEndereco(dadosEndereco);

        for (const tentativa of tentativas) {
            // Nominatim
            try {
                return await geocodeNominatim(tentativa);
            } catch (e) {
                console.log("erro Nominatim");
            }

            await sleep(400);

            // Photon
            try {
                return await geocodePhoton(tentativa);
            } catch (e) {
                console.log("erro Photon");
            }

            await sleep(400);

            // Google (pago, último recurso)
            if (VITE_GOOGLE_GEO_API_KEY) {
                try {
                    return await geocodeGoogle(tentativa);
                } catch (e) {
                    console.log("erro Google");
                }
            }

            await sleep(400);
        }


        throw new Error("Endereço não localizado por nenhum serviço");
    }

    async function calcularEntrega() {
        try {
            if (!cep || !numero) {
                return setErro("Informe CEP e número");
            }

            setLoading(true);
            setErro("");

            // ViaCEP
            const cepData = await buscarCep(cep);
            setDadosCep(cepData);

            // Geocode
            // const geoOrigem = await geocode(ENDERECO_LOJA);
            // setOrigem([geoOrigem.lat, geoOrigem.lng]);
            setOrigem([ENDERECO_LOJA.lat, ENDERECO_LOJA.lng]);

            const geoDestino = await geocodeComTentativasFallback({
                logradouro: cepData.logradouro,
                numero,
                bairro: cepData.bairro,
                cidade: cepData.localidade,
                uf: cepData.uf,
                cep: cepData.cep
            });
            setDestino([geoDestino.lat, geoDestino.lng]);

            // OSRM
            const url = `https://router.project-osrm.org/route/v1/driving/` +
                `${ENDERECO_LOJA.lng},${ENDERECO_LOJA.lat};` +
                `${geoDestino.lng},${geoDestino.lat}` +
                `?overview=full&geometries=geojson`;


            const res = await fetch(url);
            const data = await res.json();

            if (!data.routes?.length) {
                throw new Error("Não foi possível calcular a rota");
            }

            const route = data.routes[0];

            setRota(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

            const km = route.distance / 1000;
            setDistancia(km.toFixed(2));

            // regra de taxa
            const precoPorKm = 5;
            const valorTaxaParaCima = Math.ceil(km * precoPorKm);

            setTaxa(Number(valorTaxaParaCima.toFixed(2)));

            setEnderecoEntrega({
                endereco: {
                    cep: cepData.cep,
                    rua: cepData.logradouro,
                    numero,
                    bairro: cepData.bairro,
                    cidade: cepData.localidade,
                    uf: cepData.uf
                },
                latlng: {
                    lat: geoDestino.lat,
                    lng: geoDestino.lng
                },
                distanciaKm: km,
                observacao
            });
        } catch (err) {
            setErro(err.message);
            setTaxa(0);
        } finally {
            setLoading(false);
        }
    }

    function AjustarZoomRota({ origem, destino }) {
        const map = useMap();

        if (!origem || !destino) return null;

        const bounds = L.latLngBounds([origem, destino]);

        map.fitBounds(bounds, {
            padding: [40, 40]
        });

        return null;
    }

    function usarLocalizacaoAtualSemReverse() {
        if (!navigator.geolocation) {
            setErro("Geolocalização não suportada pelo navegador");
            return;
        }

        setLoading(true);
        setErro("");

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    console.log(pos)

                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setOrigem([ENDERECO_LOJA.lat, ENDERECO_LOJA.lng]);
                    setDestino([lat, lng]);

                    const url =
                        `https://router.project-osrm.org/route/v1/driving/` +
                        `${ENDERECO_LOJA.lng},${ENDERECO_LOJA.lat};` +
                        `${lng},${lat}` +
                        `?overview=full&geometries=geojson`;

                    const res = await fetch(url);
                    const data = await res.json();

                    if (!data.routes?.length) {
                        throw new Error("Não foi possível calcular a rota");
                    }

                    const route = data.routes[0];

                    setRota(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

                    const km = route.distance / 1000;
                    setDistancia(km.toFixed(2));

                    const precoPorKm = 3;
                    const valorTaxa = Math.max(5, km * precoPorKm);

                    setTaxa(Number(valorTaxa.toFixed(2)));

                    setEnderecoEntrega({
                        endereco: {
                            tipo: "localizacao_atual"
                        },
                        latlng: { lat, lng },
                        distanciaKm: km
                    });
                } catch (err) {
                    setErro(err.message);
                    setTaxa(0);
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setErro("Permissão de localização negada");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    }

    async function reverseGeocodeOSM(lat, lng) {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );

        const data = await res.json();

        if (!data.address) {
            throw new Error("Não foi possível identificar o endereço");
        }

        return {
            cep: data.address.postcode || "",
            logradouro: data.address.road || "",
            bairro: data.address.suburb || data.address.neighbourhood || "",
            localidade: data.address.city || data.address.town || "",
            uf: data.address.state || ""
        };
    }

    async function usarLocalizacaoAtual() {
        if (!navigator.geolocation) {
            setErro("Geolocalização não suportada");
            return;
        }

        setLoading(true);
        setErro("");

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    const endereco = await reverseGeocodeOSM(lat, lng);

                    if (!endereco.cep) {
                        throw new Error("CEP não identificado pela localização");
                    }

                    setCep(endereco.cep);
                    setDadosCep(endereco);
                    setNumero("");

                    // Origem fixa (loja)
                    setOrigem([ENDERECO_LOJA.lat, ENDERECO_LOJA.lng]);
                    setDestino([lat, lng]);

                    // OSRM
                    const url =
                        `https://router.project-osrm.org/route/v1/driving/` +
                        `${ENDERECO_LOJA.lng},${ENDERECO_LOJA.lat};` +
                        `${lng},${lat}?overview=full&geometries=geojson`;

                    const res = await fetch(url);
                    const data = await res.json();

                    if (!data.routes?.length) {
                        throw new Error("Não foi possível calcular a rota");
                    }

                    const route = data.routes[0];

                    setRota(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

                    const km = route.distance / 1000;
                    setDistancia(km.toFixed(2));

                    const precoPorKm = 3;
                    const valorTaxa = Math.max(5, km * precoPorKm);
                    setTaxa(Number(valorTaxa.toFixed(2)));

                    setEnderecoEntrega({
                        endereco: {
                            cep: endereco.cep,
                            rua: endereco.logradouro,
                            numero,
                            bairro: endereco.bairro,
                            cidade: endereco.localidade,
                            uf: endereco.uf,
                            tipo: "localizacao_atual"
                        },
                        latlng: { lat, lng },
                        distanciaKm: km,
                        observacao
                    });
                } catch (err) {
                    setErro(err.message);
                    setTaxa(0);
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setErro("Permissão de localização negada");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    }


    return (
        <>
            <Typography variant="subtitle1" fontWeight="bold">
                Endereço de entrega
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                    label="CEP"
                    fullWidth
                    size="small"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    disabled={usarLocAtual}
                />

                <TextField
                    label="Número"
                    fullWidth
                    size="small"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                />

            </Box >

            <FormControlLabel
                control={
                    <Checkbox
                        checked={usarLocAtual}
                        onChange={(e) => setUsarLocAtual(e.target.checked)}
                    />
                }
                label="Usar localização atual"
            />

            {
                dadosCep && (
                    <Typography variant="caption" sx={{ display: "block" }}>
                        {dadosCep.logradouro} - {dadosCep.bairro}, {dadosCep.localidade}/{dadosCep.uf}
                    </Typography>
                )
            }

            <TextField
                label="Observação"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
            />

            <Button
                sx={{ mt: 1 }}
                variant="contained"
                fullWidth
                onClick={usarLocAtual ? usarLocalizacaoAtual : calcularEntrega}
                disabled={loading}
            >
                Calcular taxa
            </Button>

            {
                loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )
            }

            {
                erro && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {erro}
                    </Typography>
                )
            }

            {
                origem && destino && (
                    <>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                📏 Distância: {distancia} km 💰 Taxa: R$ {taxa.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">

                            </Typography>
                        </Box>
                        <Box sx={{ height: 280 }}>
                            <MapContainer style={{ height: "100%", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <Marker position={origem} />
                                <Marker position={destino} />
                                <Polyline positions={rota} />

                                <AjustarZoomRota origem={origem} destino={destino} />
                            </MapContainer>
                        </Box>
                    </>
                )
            }
        </>
    );
}
