import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField
} from "@mui/material";
import { useState } from "react";

const bordas = [
  { id: "sem", nome: "Sem borda", valor: 0 },
  { id: "catupiry", nome: "Catupiry", valor: 5 },
  { id: "cheddar", nome: "Cheddar", valor: 5 }
];

export default function PizzaModal({
  open,
  onClose,
  sabores,
  tamanho,
  onConfirm
}) {
  const [borda, setBorda] = useState(bordas[0]);
  const [obs, setObs] = useState("");

  /* -------- PREÇO -------- */
  const precoBase =
    Math.max(...sabores.map((s) => s.valor)) * tamanho.fator;

  const precoFinal = precoBase + borda.valor;

  const confirmar = () => {
    onConfirm({
      sabores,
      borda,
      obs,
      precoFinal
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Personalizar Pizza</DialogTitle>

      <DialogContent>
        {/* SABORES */}
        <Typography fontWeight="bold" gutterBottom>
          Sabores selecionados
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {sabores.map((s) => (
            <Button key={s.id} variant="contained">
              {s.nome}
            </Button>
          ))}
        </Box>

        {/* BORDA */}
        <Typography fontWeight="bold" mt={3}>
          Borda recheada
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          {bordas.map((b) => (
            <Button
              key={b.id}
              variant={borda.id === b.id ? "contained" : "outlined"}
              onClick={() => setBorda(b)}
            >
              {b.nome}
              {b.valor > 0 && ` (+R$ ${b.valor})`}
            </Button>
          ))}
        </Box>

        {/* OBS */}
        <TextField
          label="Observações"
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 3 }}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography fontWeight="bold" sx={{ flexGrow: 1 }}>
          Total: R$ {precoFinal.toFixed(2)}
        </Typography>

        <Button variant="contained" onClick={confirmar}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
