
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

async function geocodeGoogle(apiKey, cep) {

    const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${apiKey}`
    );

    const data = await res.json();

    if (data.status !== "OK") throw new Error("Google sem resultado");

    return data.results[0].geometry.location;
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
                numero: numero || "",
                bairro: cepData.bairro,
                cidade: cepData.localidade,
                uf: cepData.uf,
                tipo: "manual"
            },
            latlng: { lat: geoDestino.lat, lng: geoDestino.lng },
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

                setEnderecoEntrega(prev => ({
                    ...prev,
                    endereco: {
                        ...prev?.endereco,
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
                }));


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