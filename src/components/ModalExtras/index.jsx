import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,

} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function ModalExtras({
  open,
  onClose,
  produto,
  extrasDisponiveis = [],
  onConfirm
}) {
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (!open) {
      setExtrasSelecionados([]);
      setObs("");
    }
  }, [open]);

  const toggleExtra = (extra) => {
    setExtrasSelecionados(prev =>
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const precoFinal =
    (produto?.valor || 0) +
    extrasSelecionados.reduce((t, e) => t + e.valor, 0);


  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{produto.nome}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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

        <TextField
          label="Observações"
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 3 }}
          value={obs}
          onChange={e => setObs(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Typography fontWeight="bold">
          Total: R$ {precoFinal.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            onConfirm({
              extras: extrasSelecionados,
              obs,
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

