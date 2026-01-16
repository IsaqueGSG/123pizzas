import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  IconButton
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function ModalExtras({
  open,
  onClose,
  sabores,
  bordas = [],
  extrasDisponiveis = [],
  onConfirm
}) {
  const [extrasAbertos, setExtrasAbertos] = useState(false);
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [borda, setBorda] = useState(null);
  const [obs, setObs] = useState("");

  /* -------- INIT BORDA -------- */
  useEffect(() => {
    if (open && bordas.length) {
      const semBorda =
        bordas.find((b) => b.valor === 0) || bordas[0];
      setBorda(semBorda);
    }
  }, [open, bordas]);

  /* -------- RESET -------- */
  useEffect(() => {
    if (!open) {
      setExtrasSelecionados([]);
      setExtrasAbertos(false);
      setObs("");
      setBorda(null);
    }
  }, [open]);

  /* -------- EXTRAS -------- */
  const toggleExtra = (extra) => {
    setExtrasSelecionados((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  /* -------- PREÇO -------- */
  const precoBase = sabores.length
    ? Math.max(...sabores.map((s) => s.valor))
    : 0;

  const valorExtras = extrasSelecionados.reduce(
    (total, e) => total + e.valor,
    0
  );

  const valorBorda = borda?.valor || 0;

  const precoFinal = precoBase + valorBorda + valorExtras;

  /* -------- CONFIRMAR -------- */
  const confirmar = () => {
    onConfirm({
      sabores,
      borda,
      extras: extrasSelecionados,
      obs,
      precoFinal
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        Extras
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

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
        {bordas.length > 0 && (
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Borda recheada</InputLabel>
            <Select
              value={borda?.id || ""}
              label="Borda recheada"
              onChange={(e) =>
                setBorda(
                  bordas.find((b) => b.id === e.target.value)
                )
              }
            >
              {bordas.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.nome}
                  {b.valor > 0 &&
                    ` (+R$ ${b.valor.toFixed(2)})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* EXTRAS */}
        {extrasDisponiveis.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setExtrasAbertos(!extrasAbertos)}
            >
              Extras {extrasAbertos ? "▲" : "▼"}
            </Button>

            <Collapse in={extrasAbertos}>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap"
                }}
              >
                {extrasDisponiveis.map((extra) => {
                  const ativo = extrasSelecionados.some(
                    (e) => e.id === extra.id
                  );

                  return (
                    <Button
                      key={extra.id}
                      variant={ativo ? "contained" : "outlined"}
                      onClick={() => toggleExtra(extra)}
                    >
                      {extra.nome}
                      {extra.valor > 0 &&
                        ` (+R$ ${extra.valor.toFixed(2)})`}
                    </Button>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        )}

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

        <Button
          variant="contained"
          onClick={confirmar}
          disabled={!borda}
        >
          Adicionar ao carrinho
        </Button>
      </DialogActions>
    </Dialog>
  );
}
