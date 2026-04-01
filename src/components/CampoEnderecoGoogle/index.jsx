import { useRef, useEffect, useState } from "react";
import { Box, TextField, CircularProgress } from "@mui/material";
import { useEntrega } from "../../contexts/EntregaContext";

export default function CampoEnderecoGoogle() {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const sessionTokenRef = useRef(null);

  const { atualizarCampo, setSessionToken } = useEntrega();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!window.google?.maps?.places) return;

    // 🔥 Session Token OFICIAL (economia real)
    sessionTokenRef.current =
      new window.google.maps.places.AutocompleteSessionToken();

    autocompleteRef.current =
      new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "br" },
        fields: ["place_id", "formatted_address", "geometry", "name"],
        types: ["address"],
      });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) return;

      atualizarCampo("placeId", place.place_id);
      atualizarCampo("enderecoFormatado", place.formatted_address);
      atualizarCampo("lat", place.geometry.location.lat());
      atualizarCampo("lng", place.geometry.location.lng());

      setSessionToken(sessionTokenRef.current);

      // Nova sessão (correto para billing)
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    });

    setLoaded(true);

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        label="Endereço de entrega"
        fullWidth
        size="small"
        inputRef={inputRef}
        placeholder="Digite seu endereço (Rua, número, bairro)"
        InputProps={{
          endAdornment: !loaded ? <CircularProgress size={20} /> : null,
        }}
      />
    </Box>
  );
}
