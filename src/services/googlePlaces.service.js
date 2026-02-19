const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_GEO_API_KEY;

export async function getPlaceDetails(placeId, sessionToken) {
    const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${placeId}` +
        `&fields=geometry,address_component,formatted_address` +
        `&sessiontoken=${sessionToken}` + // 🔥 REDUZ CUSTO
        `&key=${GOOGLE_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
        console.error("Place Details error:", data);
        throw new Error("Endereço não encontrado");
    }

    const result = data.result;
    const components = result.address_components;

    const get = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

    return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        rua: get("route"),
        numero: get("street_number"),
        bairro: get("sublocality") || get("neighborhood"),
        cidade: get("administrative_area_level_2"),
        uf: get("administrative_area_level_1"),
        enderecoFormatado: result.formatted_address,
    };
}

// services/googlePlaces.service.js

export function getPlaceDetailsFromJS(placeId, sessionToken) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      return reject(new Error("Google Places não carregado"));
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div") // não precisa de mapa
    );

    service.getDetails(
      {
        placeId,
        fields: ["geometry", "address_components", "formatted_address"],
        sessionToken, // 🔥 token oficial (economia real)
      },
      (result, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !result
        ) {
          return reject(new Error("Endereço não encontrado"));
        }

        const components = result.address_components;

        const get = (type) =>
          components.find((c) => c.types.includes(type))?.long_name || "";

        resolve({
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
          rua: get("route"),
          numero: get("street_number"),
          bairro: get("sublocality") || get("neighborhood"),
          cidade: get("administrative_area_level_2"),
          uf: get("administrative_area_level_1"),
          enderecoFormatado: result.formatted_address,
        });
      }
    );
  });
}

