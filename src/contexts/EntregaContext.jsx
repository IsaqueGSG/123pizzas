import { createContext, useContext, useState, useRef } from "react";
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

  // Controla qual cálculo é o mais recente
  const calculoIdRef = useRef(0);

  const clearEndereco = () => {
    calculoIdRef.current += 1;
    setEndereco(estadoInicial);
    setRota([]);
  };

  function atualizarCampo(campo, valor) {
    setEndereco(prev => ({
      ...prev,
      [campo]: valor
    }));
  }

  const encontrarZonaCliente = (lat, lng, zonas) => {
    console.log("========== BUSCANDO ZONA ==========");
    console.log("LAT CLIENTE:", lat);
    console.log("LNG CLIENTE:", lng);
    console.log("TOTAL DE ZONAS:", zonas?.length);

    if (
      lat === null ||
      lat === undefined ||
      lng === null ||
      lng === undefined ||
      !zonas?.length
    ) {
      console.log("Dados insuficientes para procurar zona");
      return null;
    }

    const ponto = point([
      Number(lng),
      Number(lat)
    ]);

    for (const zona of zonas) {
      if (
        !zona.coordenadas ||
        zona.coordenadas.length < 3
      ) {
        continue;
      }

      const coordenadas = zona.coordenadas.map(coord => [
        Number(coord.lng),
        Number(coord.lat)
      ]);

      // Fecha o polígono caso necessário
      if (
        coordenadas[0][0] !==
        coordenadas[coordenadas.length - 1][0] ||
        coordenadas[0][1] !==
        coordenadas[coordenadas.length - 1][1]
      ) {
        coordenadas.push(coordenadas[0]);
      }

      const poligono = polygon([
        coordenadas
      ]);

      const dentro = booleanPointInPolygon(
        ponto,
        poligono
      );

      console.log(
        `Zona "${zona.nome}" →`,
        dentro,
        "valor:",
        zona.valor
      );

      if (dentro) {
        console.log(
          "✅ ZONA ENCONTRADA:",
          zona.nome
        );

        console.log(
          "💰 VALOR:",
          zona.valor
        );

        return zona;
      }
    }

    console.log(
      "❌ NENHUMA ZONA ENCONTRADA"
    );

    return null;
  };

  function calcularTaxaEntrega(km) {
    const taxaKm = Number(preferencias?.taxaEntregaKm ?? 0);
    const taxaMinima = Number(preferencias?.taxaEntregaMinima ?? 0);

    console.log("===== CONFIG TAXA =====");
    console.log("preferencias:", preferencias);
    console.log("taxaEntregaKm:", preferencias?.taxaEntregaKm);
    console.log("taxaEntregaMinima:", preferencias?.taxaEntregaMinima);
    console.log("taxaKm convertido:", taxaKm);
    console.log("taxaMinima convertida:", taxaMinima);
    console.log("km:", km);
    console.log("=======================");

    const taxaCalculada = km * taxaKm;

    const taxaFinal = Math.max(
      taxaMinima,
      taxaCalculada
    );

    return Math.ceil(taxaFinal);
  }

  function fetchComTimeout(url, tempo = 4000) {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout OSRM")),
          tempo
        )
      )
    ]);
  }

  function calcularRotaGoogleJS(origem, destino) {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps) {
        return reject(
          new Error("Google Maps não carregado")
        );
      }

      const directionsService =
        new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: origem,
          destination: destino,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status !== "OK") {
            return reject(
              new Error(
                `Erro no DirectionsService: ${status}`
              )
            );
          }

          const route = result.routes?.[0];
          const leg = route?.legs?.[0];

          if (!route || !leg) {
            return reject(
              new Error("Rota não encontrada")
            );
          }

          const km = leg.distance.value / 1000;

          const polyline =
            route.overview_path.map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }));

          resolve({
            km,
            polyline
          });
        }
      );
    });
  }

  function esperarGoogle() {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        reject(
          new Error("Google Maps não carregou")
        );
      }, 5000);
    });
  }

  async function calcularEntrega(enderecoAtual = null) {
    const meuCalculoId = ++calculoIdRef.current;

    const dados = enderecoAtual
      ? { ...enderecoAtual }
      : { ...endereco };

    try {
      setEndereco(prev => ({
        ...prev,
        loading: true,
        erro: ""
      }));

      if (!dados.placeId) {
        throw new Error("Selecione um endereço na lista");
      }

      if (
        dados.lat === null ||
        dados.lat === undefined ||
        dados.lng === null ||
        dados.lng === undefined
      ) {
        throw new Error(
          "As coordenadas do endereço não foram encontradas"
        );
      }

      // Se outro cálculo começou enquanto aguardávamos,
      // não mexemos mais no estado.
      if (meuCalculoId !== calculoIdRef.current) {
        return;
      }

      if (!enderecoLoja?.lat || !enderecoLoja?.lng) {
        throw new Error(
          "Endereço da loja não configurado"
        );
      }

      const lojaLng = Number(enderecoLoja.lng);
      const lojaLat = Number(enderecoLoja.lat);

      const destinoLng = Number(dados.lng);
      const destinoLat = Number(dados.lat);

      if (
        !Number.isFinite(lojaLat) ||
        !Number.isFinite(lojaLng) ||
        !Number.isFinite(destinoLat) ||
        !Number.isFinite(destinoLng)
      ) {
        throw new Error(
          "Coordenadas inválidas"
        );
      }

      // --------------------------------------------------
      // CACHE
      // --------------------------------------------------

      const cacheKey =
        `${lojaLat},${lojaLng}_` +
        `${destinoLat},${destinoLng}`;

      let km = 0;
      let rotaCoords = [];
      let usarCache = false;

      const rotaCache =
        sessionStorage.getItem(cacheKey);

      if (rotaCache) {
        try {
          const parsed = JSON.parse(rotaCache);

          const EXPIRA_EM =
            1000 * 60 * 60;

          if (
            Number.isFinite(parsed?.km) &&
            Array.isArray(parsed?.rota) &&
            parsed.rota.length > 0 &&
            Date.now() - parsed.timestamp <
            EXPIRA_EM
          ) {
            km = Number(parsed.km);
            rotaCoords = parsed.rota;
            usarCache = true;
          }
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      // --------------------------------------------------
      // CALCULAR ROTA
      // --------------------------------------------------

      if (!usarCache) {
        try {
          console.log(
            "Calculando rota com OSRM..."
          );

          const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${lojaLng},${lojaLat};` +
            `${destinoLng},${destinoLat}` +
            `?overview=full&geometries=geojson`;

          const res =
            await fetchComTimeout(url, 4000);

          if (!res?.ok) {
            throw new Error(
              "OSRM offline"
            );
          }

          const data = await res.json();

          if (!data.routes?.length) {
            throw new Error(
              "Sem rota OSRM"
            );
          }

          const route = data.routes[0];

          km =
            Number(route.distance) / 1000;

          rotaCoords =
            route.geometry.coordinates.map(
              ([lng, lat]) => ({
                lat,
                lng
              })
            );

        } catch (osrmError) {
          console.warn(
            "OSRM falhou:",
            osrmError.message
          );

          await esperarGoogle();

          const result =
            await calcularRotaGoogleJS(
              {
                lat: lojaLat,
                lng: lojaLng
              },
              {
                lat: destinoLat,
                lng: destinoLng
              }
            );

          km = Number(result.km);
          rotaCoords = result.polyline;
        }
      }

      // --------------------------------------------------
      // VALIDAÇÃO DO KM
      // --------------------------------------------------

      if (!Number.isFinite(km)) {
        throw new Error(
          "Distância da rota inválida"
        );
      }

      console.log(
        "Distância calculada:",
        km,
        "km"
      );

      // --------------------------------------------------
      // CACHE
      // --------------------------------------------------

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          km,
          rota: rotaCoords,
          timestamp: Date.now()
        })
      );

      // --------------------------------------------------
      // ZONA DE ENTREGA
      // --------------------------------------------------

      const zona =
        encontrarZonaCliente(
          destinoLat,
          destinoLng,
          zonasEntrega
        );

      let taxa;

      if (zona) {
        taxa = Number(zona.valor);

        console.log(
          "Zona de entrega encontrada:",
          zona
        );

        console.log(
          "Taxa da zona:",
          taxa
        );

        if (!Number.isFinite(taxa)) {
          taxa = calcularTaxaEntrega(km);
        }
      } else {
        taxa = calcularTaxaEntrega(km);

        console.log(
          "Nenhuma zona encontrada."
        );

        console.log(
          "Taxa calculada por KM:",
          taxa
        );
      }

      taxa = Number(taxa) || 0;

      console.log(
        "========== TAXA FINAL =========="
      );
      console.log("KM:", km);
      console.log("Taxa:", taxa);
      console.log("===============================");

      // --------------------------------------------------
      // PROTEÇÃO CONTRA RACE CONDITION
      // --------------------------------------------------

      if (meuCalculoId !== calculoIdRef.current) {
        return;
      }

      // --------------------------------------------------
      // ATUALIZA ENDEREÇO
      // --------------------------------------------------

      setEndereco(prev => ({
        ...prev,

        placeId: dados.placeId,

        rua: dados.rua ?? prev.rua,
        bairro: dados.bairro ?? prev.bairro,
        cidade: dados.cidade ?? prev.cidade,
        uf: dados.uf ?? prev.uf,
        cep: dados.cep ?? prev.cep,

        enderecoFormatado:
          dados.enderecoFormatado ??
          prev.enderecoFormatado,

        lat: destinoLat,
        lng: destinoLng,

        distanciaKm: km,

        taxaEntrega: taxa,

        loading: false,
        erro: ""
      }));

      setRota(rotaCoords);

      return taxa;

    } catch (err) {
      console.error(
        "Erro ao calcular entrega:",
        err
      );

      // Não deixa uma requisição antiga
      // zerar uma taxa nova.
      if (
        meuCalculoId !== calculoIdRef.current
      ) {
        return;
      }

      setEndereco(prev => ({
        ...prev,
        loading: false,
        erro: err.message,
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
        setSessionToken
      }}
    >
      {children}
    </EntregaContext.Provider>
  );
}

export function useEntrega() {
  return useContext(EntregaContext);
}