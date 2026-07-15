import { createContext, useContext, useState, useEffect } from "react";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

const EntregaContext = createContext();

const estadoInicial = {
  placeId: "",
  enderecoFormatado: "",

  cep: "",
  numero: "",
  rua: "",
  bairro: "",
  cidade: "",
  uf: "",

  lat: null,
  lng: null,

  distanciaKm: 0,
  taxaEntrega: 0,

  loading: false,
  erro: "",
  observacao: ""
};

import { usePreferencias } from "./PreferenciasContext";

import { getPlaceDetailsFromJS } from "../services/googlePlaces.service";

export function EntregaProvider({ children }) {
  const { preferencias } = usePreferencias();
  const zonasEntrega = preferencias?.zonasEntrega || [];
  const enderecoLoja = preferencias?.enderecoLoja;
  const [sessionToken, setSessionToken] = useState(null);

  const [endereco, setEndereco] = useState(estadoInicial);
  const [rota, setRota] = useState([]);

  const clearEndereco = () => setEndereco(estadoInicial);

  function atualizarCampo(campo, valor) {
    setEndereco(prev => ({ ...prev, [campo]: valor }));
  }

  function encontrarZonaCliente(lat, lng, zonas) {
    const ponto = point([lng, lat]);

    for (const zona of zonas) {
      const coords = zona.coordenadas.map(coord => [coord.lng, coord.lat]);

      // fecha o polígono automaticamente (produção)
      if (
        coords.length > 0 &&
        (coords[0][0] !== coords[coords.length - 1][0] ||
          coords[0][1] !== coords[coords.length - 1][1])
      ) {
        coords.push(coords[0]);
      }

      const poly = polygon([coords]);

      if (booleanPointInPolygon(ponto, poly)) {
        return zona;
      }
    }

    return null;
  }

  function calcularTaxaEntrega(km) {
    const taxaKm = Number(preferencias?.taxaEntregaKm || 0);
    const taxaMin = Number(preferencias?.taxaEntregaMinima || 0);

    const taxaCalculada = km * taxaKm;
    const taxaFinal = Math.max(taxaMin, taxaCalculada);

    // arredonda para cima e retorna inteiro
    return Math.ceil(taxaFinal);
  }

  function fetchComTimeout(url, tempo = 4000) {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout OSRM")), tempo)
      )
    ]);
  }

  function calcularRotaGoogleJS(origem, destino) {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        return reject(new Error("Google Maps não carregado"));
      }

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: origem,
          destination: destino,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status !== "OK") {
            return reject(new Error("Erro no DirectionsService"));
          }

          const route = result.routes[0];
          const leg = route.legs[0];

          const km = leg.distance.value / 1000;

          const polyline = route.overview_path.map(p => ({
            lat: p.lat(),
            lng: p.lng()
          }));

          resolve({ km, polyline });
        }
      );
    });
  }

  function esperarGoogle() {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) return resolve();

      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Google Maps não carregou"));
      }, 5000);
    });
  }

  async function calcularEntrega() {
    try {
      setEndereco(prev => ({ ...prev, loading: true, erro: "" }));

      if (!endereco.placeId) {
        throw new Error("Selecione um endereço na lista");
      }

      if (!endereco.numero) {
        throw new Error("Informe o número do endereço");
      }

      // 🔥 GOOGLE PLACE DETAILS (precisão alta)
      const details = await getPlaceDetailsFromJS(
        endereco.placeId,
        sessionToken
      );

      if (!enderecoLoja?.lat || !enderecoLoja?.lng) {
        throw new Error("Endereço da loja não configurado");
      }

      const lojaLng = Number(enderecoLoja.lng);
      const lojaLat = Number(enderecoLoja.lat);
      const destinoLng = Number(details.lng);
      const destinoLat = Number(details.lat);

      let km = 0;
      let rotaCoords = [];

      const cacheKey = `${lojaLat},${lojaLng}_${destinoLat},${destinoLng}`;
      const rotaCache = sessionStorage.getItem(cacheKey);
      let usarCache = false;

      if (rotaCache) {
        const parsed = JSON.parse(rotaCache);

        const EXPIRA_EM = 1000 * 60 * 60; // 1 hora

        if (
          parsed?.km &&
          parsed?.rota?.length > 0 &&
          Date.now() - parsed.timestamp < EXPIRA_EM
        ) {
          km = parsed.km;
          rotaCoords = parsed.rota;
          usarCache = true;
        }
      }

      if (!usarCache) {
        try {
          console.log("Calculando rota com OSRM...");
          // 🔥 OSRM
          const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${lojaLng},${lojaLat};${destinoLng},${destinoLat}` +
            `?overview=full&geometries=geojson`;

          const res = await fetchComTimeout(url, 4000);

          if (!res || !res.ok) throw new Error("OSRM offline");

          const data = await res.json();

          if (!data.routes?.length) throw new Error("Sem rota OSRM");

          const route = data.routes[0];

          km = route.distance / 1000;

          rotaCoords = route.geometry.coordinates.map(([lng, lat]) => ({
            lat,
            lng
          }));

        } catch (err) {
          console.warn("⚠️ OSRM falhou:", err.message);

          try {
            console.log("Calculando rota com google...");

            esperarGoogle();
            const result = await calcularRotaGoogleJS(
              { lat: lojaLat, lng: lojaLng },
              { lat: destinoLat, lng: destinoLng }
            );

            km = result.km;
            rotaCoords = result.polyline;

          } catch (googleErr) {
            console.error("❌ Google também falhou:", googleErr);
            throw new Error("Não foi possível calcular a rota no momento");
          }
        }
      }

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          km,
          rota: rotaCoords,
          timestamp: Date.now()
        })
      );


      const zona = encontrarZonaCliente(destinoLat, destinoLng, zonasEntrega);
      let taxa;
      if (zona) {
        taxa = zona.valor; // prioridade zona
      } else {
        taxa = calcularTaxaEntrega(km); // fallback km
      }

      setEndereco(prev => ({
        ...prev,
        rua: details.rua,
        bairro: details.bairro,
        cidade: details.cidade,
        uf: details.uf,
        enderecoFormatado: details.enderecoFormatado,
        lat: destinoLat,
        lng: destinoLng,
        distanciaKm: km,
        taxaEntrega: taxa,
        loading: false
      }));

      setRota(rotaCoords);

    } catch (err) {
      setEndereco(prev => ({
        ...prev,
        erro: err.message,
        loading: false,
        taxaEntrega: 0
      }));

      setRota([]);
    }
  }

  return (
    <EntregaContext.Provider
      value={{
        enderecoLoja,
        endereco,
        setEndereco, 
        rota,
        setRota,     
        clearEndereco,
        atualizarCampo,
        calcularEntrega,
        sessionToken,
        setSessionToken,
      }}
    >
      {children}
    </EntregaContext.Provider>
  );
}

export function useEntrega() {
  return useContext(EntregaContext);
}
