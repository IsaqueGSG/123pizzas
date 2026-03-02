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

      // Mantém seu OSRM (perfeito e gratuito)
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${lojaLng},${lojaLat};${destinoLng},${destinoLat}` +
        `?overview=full&geometries=geojson`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao calcular rota");

      const data = await res.json();
      if (!data.routes?.length) throw new Error("Rota não encontrada");

      const route = data.routes[0];
      const km = route.distance / 1000;
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

      setRota(
        route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
      );

    } catch (err) {
      setEndereco(prev => ({
        ...prev,
        erro: err.message,
        loading: false,
        taxaEntrega: 0
      }));
    }
  }



  return (
    <EntregaContext.Provider
      value={{
        enderecoLoja,
        endereco,
        rota,
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
