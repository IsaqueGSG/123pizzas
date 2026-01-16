import { useState } from "react";
import { useEntrega } from "../../contexts/EntregaContext";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";

export default function EnderecoEntrega({ lojaLat, lojaLon, valorPorKm = 2 }) {
  const {
    cep,
    numero,
    enderecoCompleto,
    distancia,
    taxa,
    loading,
    erro,
    atualizarEntrega
  } = useEntrega();

  const [cepInput, setCepInput] = useState(cep || "");
  const [numeroInput, setNumeroInput] = useState(numero || "");

  const calcular = async () => {
    if (!cepInput || !numeroInput) {
      alert("Informe CEP e número da casa");
      return;
    }

    await atualizarEntrega(cepInput, numeroInput, lojaLat, lojaLon, valorPorKm);
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Endereço para entrega
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          label="CEP"
          size="small"
          value={cepInput}
          onChange={(e) => setCepInput(e.target.value)}
        />
        <TextField
          label="Número"
          size="small"
          value={numeroInput}
          onChange={(e) => setNumeroInput(e.target.value)}
        />
        <Button variant="contained" size="small" onClick={calcular}>
          Calcular
        </Button>
      </Box>

      {loading && <CircularProgress size={24} />}

      {erro && (
        <Typography color="error" variant="body2">
          {erro}
        </Typography>
      )}

      {enderecoCompleto && !loading && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">Endereço: {enderecoCompleto}</Typography>
          <Typography variant="body2">
            Distância: {distancia.toFixed(2)} km
          </Typography>
          <Typography variant="body2">
            Taxa de entrega: R$ {taxa.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
