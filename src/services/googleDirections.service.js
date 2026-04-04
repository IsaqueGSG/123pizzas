// googleDirections.service.js

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_GEO_API_KEY;

function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
        let b, shift = 0, result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({
            lat: lat / 1e5,
            lng: lng / 1e5
        });
    }

    return points;
}

export async function calcularRotaGoogle(origem, destino) {
    const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origem.lat},${origem.lng}` +
        `&destination=${destino.lat},${destino.lng}` +
        `&key=${GOOGLE_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
        console.error("Google Directions error:", data);
        throw new Error("Erro no Google Directions");
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // 🔥 distância em km
    const km = leg.distance.value / 1000;

    // 🔥 polyline (precisa decodificar)
    const points = route.overview_polyline.points;

    return {
        km,
        polyline: decodePolyline(points)
    };
}

