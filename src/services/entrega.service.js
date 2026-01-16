// Haversine para calcular distância em km
export function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;

    const R = 6371; // raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 1️⃣ Busca dados do CEP via ViaCEP
export async function getDadosCep(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("CEP inválido ou não encontrado");
    const data = await res.json();
    if (data.erro) throw new Error("CEP não encontrado");

    // Adiciona campos extras para facilitar
    return {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        estado: estadoPorUF(data.uf), // opcional
        regiao: regiaoPorUF(data.uf),  // opcional
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi
    };
}

// Auxiliares para estado e região
function estadoPorUF(uf) {
    const map = {
        AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
        BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
        GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
        MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
        PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
        RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
        SP: "São Paulo", SE: "Sergipe", TO: "Tocantins"
    };
    return map[uf] || "";
}

function regiaoPorUF(uf) {
    const regiao = {
        N: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        NE: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        SE: ["ES", "MG", "RJ", "SP"],
        S: ["PR", "RS", "SC"],
        CO: ["DF", "GO", "MT", "MS"]
    };
    for (let r in regiao) if (regiao[r].includes(uf)) return r;
    return "";
}

// 2️⃣ Geocoding via OpenStreetMap / Nominatim
export async function geocodeEnderecoOSM(endereco) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        endereco
    )}&limit=1`;
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "123pedidos" } // obrigatório pelo Nominatim
        });
        const data = await res.json();
        if (!data || data.length === 0) return null; // não encontrou
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (err) {
        console.error("Erro no geocodeOSM:", err);
        return null;
    }
}



// 3️⃣ Calcula taxa de entrega
export function calcularTaxaEntrega(lojaLat, lojaLon, clienteLat, clienteLon, valorPorKm = 2) {
    const distancia = calcularDistancia(lojaLat, lojaLon, clienteLat, clienteLon);
    const taxa = distancia * valorPorKm;
    return { distancia, taxa };
}

// 4️⃣ Função completa para calcular taxa a partir do CEP + número
export async function calcularEntregaPorCep(cep, numero, lojaLat, lojaLon, valorPorKm = 2) {
    // 1️⃣ pega dados do CEP
    const dadosCep = await getDadosCep(cep);

    // 2️⃣ monta endereço completo
    const enderecoCompleto = `${dadosCep.logradouro}, ${numero}, ${dadosCep.bairro}, ${dadosCep.localidade}, ${dadosCep.uf}, Brasil`;

    // 3️⃣ geocode
    const { lat, lon } = await geocodeEnderecoOSM(enderecoCompleto);

    // 4️⃣ calcula taxa
    const { distancia, taxa } = calcularTaxaEntrega(lojaLat, lojaLon, lat, lon, valorPorKm);

    return {
        dadosCep,
        enderecoCompleto,
        lat,
        lon,
        distancia,
        taxa
    };
}
