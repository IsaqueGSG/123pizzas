import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { useState, useEffect } from "react";

export default function ModalExtras({
  open,
  onClose,
  produto,
  extrasDisponiveis = [],
  bordasDisponiveis = [],
  onConfirm
}) {
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [bordaSelecionada, setBordaSelecionada] = useState(null);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    if (!open) {
      setExtrasSelecionados([]);
      setBordaSelecionada(null);
      setObservacao("");
    }
  }, [open]);

  const toggleExtra = (extra) => {
    setExtrasSelecionados(prev =>
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  // Calcula preço final com extras + borda
  const precoFinal =
    (produto?.valor || 0) +
    extrasSelecionados.reduce((t, e) => t + e.valor, 0) +
    (bordaSelecionada?.valor || 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{produto.nome}</DialogTitle>

      <DialogContent>
        {/* Extras */}
        {extrasDisponiveis.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {extrasDisponiveis.map(extra => {
              const ativo = extrasSelecionados.some(e => e.id === extra.id);
              return (
                <Button
                  key={extra.id}
                  variant={ativo ? "contained" : "outlined"}
                  onClick={() => toggleExtra(extra)}
                >
                  {extra.nome}
                  {extra.valor > 0 && ` (+R$ ${extra.valor.toFixed(2)})`}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Bordas */}
        {bordasDisponiveis.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Borda</InputLabel>
            <Select
              value={bordaSelecionada?.id || ""}
              label="Borda"
              onChange={(e) => {
                const borda = bordasDisponiveis.find(b => b.id === e.target.value);
                setBordaSelecionada(borda);
              }}
            >
              <MenuItem value="">
                Nenhuma
              </MenuItem>
              {bordasDisponiveis.map(borda => (
                <MenuItem key={borda.id} value={borda.id}>
                  {borda.nome} {borda.valor > 0 && `(+R$ ${borda.valor.toFixed(2)})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Observações */}
        <TextField
          label="Observações"
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 1 }}
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight="bold">
          Total: R$ {precoFinal.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            onConfirm({
              extras: extrasSelecionados,
              borda: bordaSelecionada,
              observacao,
              precoFinal
            })
          }
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
