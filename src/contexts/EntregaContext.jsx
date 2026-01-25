import { createContext, useContext, useState } from "react";

const EntregaContext = createContext();

const ENDERECO_LOJA = {
  lat: -23.460380170938265,
  lng: -46.41701184232687
};

const GEO_KEY = import.meta.env.VITE_GOOGLE_GEO_API_KEY;

const estadoInicial = {
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

export function EntregaProvider({ children }) {

  const [endereco, setEndereco] = useState(estadoInicial);
  const [rota, setRota] = useState([]);

  const clearEndereco = () => setEndereco(estadoInicial);

  function atualizarCampo(campo, valor) {
    setEndereco(prev => ({ ...prev, [campo]: valor }));
  }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) throw new Error("CEP inválido");

    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();

    if (data.erro) throw new Error("CEP não encontrado");

    return data;
  }

  async function geocodeGoogle(enderecoTexto) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        enderecoTexto
      )}&key=${GEO_KEY}`
    );

    const data = await res.json();
    if (data.status !== "OK") throw new Error("Endereço não localizado");

    return data.results[0].geometry.location;
  }

  async function calcularEntrega() {
    try {
      setEndereco(prev => ({ ...prev, loading: true, erro: "" }));

      const cepData = await buscarCep(endereco.cep);

      const enderecoCompleto =
        `${cepData.logradouro}, ${endereco.numero}, ` +
        `${cepData.localidade} - ${cepData.uf}`;

      const geo = await geocodeGoogle(enderecoCompleto);

      const lojaLng = Number(ENDERECO_LOJA.lng);
      const lojaLat = Number(ENDERECO_LOJA.lat);
      const destinoLng = Number(geo.lng);
      const destinoLat = Number(geo.lat);

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${lojaLng},${lojaLat};${destinoLng},${destinoLat}` +
        `?overview=full&geometries=geojson`;

      console.log("URL OSRM:", url); // debug

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao calcular rota");

      const data = await res.json();
      if (!data.routes?.length) throw new Error("Rota não encontrada");

      const route = data.routes[0];
      const km = route.distance / 1000;
      const taxa = Math.ceil(km * 5);

      setEndereco(prev => ({
        ...prev,
        rua: cepData.logradouro,
        bairro: cepData.bairro,
        cidade: cepData.localidade,
        uf: cepData.uf,

        lat: destinoLat,
        lng: destinoLng,

        distanciaKm: km,
        taxaEntrega: taxa,

        rota: route.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        ),

        loading: false
      }));

      setRota(route.geometry.coordinates.map(
        ([lng, lat]) => ({ lat, lng })
      ));

    } catch (err) {
      setEndereco(prev => ({
        ...prev,
        erro: err.message,
        loading: false,
        taxaEntrega: 0
      }));
    }
  }

  async function calcularEntregaPorLocalizacao(lat, lng) {
    try {
      setEndereco(prev => ({ ...prev, loading: true, erro: "" }));

      const lojaLng = Number(ENDERECO_LOJA.lng);
      const lojaLat = Number(ENDERECO_LOJA.lat);

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${lojaLng},${lojaLat};${lng},${lat}` +
        `?overview=full&geometries=geojson`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao calcular rota");

      const data = await res.json();
      if (!data.routes?.length) throw new Error("Rota não encontrada");

      const route = data.routes[0];
      const km = route.distance / 1000;
      const taxa = Math.ceil(km * 5);

      setEndereco(prev => ({
        ...prev,
        lat,
        lng,
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
        endereco,
        rota,
        clearEndereco,
        atualizarCampo,
        calcularEntrega,
        calcularEntregaPorLocalizacao
      }}
    >
      {children}
    </EntregaContext.Provider>
  );
}

export function useEntrega() {
  return useContext(EntregaContext);
}
