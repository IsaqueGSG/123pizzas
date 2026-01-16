import { createContext, useContext, useState } from "react";
import {
  getDadosCep,
  geocodeEnderecoOSM,
  calcularTaxaEntrega
} from "../services/entrega.service";

const EntregaContext = createContext();

export function EntregaProvider({ children }) {
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [dadosCep, setDadosCep] = useState(null);
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [distancia, setDistancia] = useState(0);
  const [taxa, setTaxa] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Função para montar endereço para geocoding
  function montarEnderecoParaGeocode(dadosCep, numero) {
    const partes = [
      dadosCep.logradouro,
      numero || "",
      dadosCep.bairro,
      dadosCep.localidade,
      dadosCep.uf,
      "Brasil"
    ].filter(Boolean); // remove strings vazias
    return partes.join(", ");
  }

  // Função principal para atualizar endereço e calcular taxa
  const atualizarEntrega = async (novoCep, novoNumero, lojaLat, lojaLon, valorPorKm = 2) => {
    try {
      setLoading(true);
      setErro("");
      setCep(novoCep);
      setNumero(novoNumero);

      // 1️⃣ Busca dados do CEP
      const dados = await getDadosCep(novoCep);
      setDadosCep(dados);

      // 2️⃣ Tenta localizar com número
      const enderecoComNumero = montarEnderecoParaGeocode(dados, novoNumero);
      let coords = await geocodeEnderecoOSM(enderecoComNumero);

      let enderecoFinal = enderecoComNumero;

      // 3️⃣ Se não encontrar, fallback sem número
      if (!coords) {
        const enderecoSemNumero = montarEnderecoParaGeocode(dados, "");
        coords = await geocodeEnderecoOSM(enderecoSemNumero);

        if (!coords) throw new Error("Endereço não encontrado ou não localizado pelo OSM");

        enderecoFinal = enderecoSemNumero;
      }

      setEnderecoCompleto(enderecoFinal);
      setLat(coords.lat);
      setLon(coords.lon);

      // 4️⃣ Calcula taxa de entrega
      const resultado = calcularTaxaEntrega(lojaLat, lojaLon, coords.lat, coords.lon, valorPorKm);
      setDistancia(resultado.distancia);
      setTaxa(resultado.taxa);

    } catch (err) {
      console.error(err);
      setErro(err.message || "Erro ao calcular entrega");
      setDadosCep(null);
      setEnderecoCompleto("");
      setLat(null);
      setLon(null);
      setDistancia(0);
      setTaxa(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EntregaContext.Provider
      value={{
        cep,
        numero,
        dadosCep,
        enderecoCompleto,
        lat,
        lon,
        distancia,
        taxa,
        loading,
        erro,
        atualizarEntrega
      }}
    >
      {children}
    </EntregaContext.Provider>
  );
}

export function useEntrega() {
  const ctx = useContext(EntregaContext);
  if (!ctx) throw new Error("useEntrega deve estar dentro do EntregaProvider");
  return ctx;
}
