import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Box,
} from "@mui/material";

export default function MotoboyModal({ open, onClose, onSelect }) {
  const [motoboys, setMotoboys] = useState([]);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  // Carregar motoboys e configuração ao abrir
  useEffect(() => {
    if (!open) return;

    const saved = sessionStorage.getItem("motoboys");
    const skip = sessionStorage.getItem("dontAskAgain") === "true";

    setDontAskAgain(skip);

    if (saved) {
      const lista = JSON.parse(saved);
      setMotoboys(lista);

      const ultimo = sessionStorage.getItem("ultimoMotoboy");

      if (ultimo && !lista.includes(ultimo)) {
        sessionStorage.removeItem("ultimoMotoboy");
        sessionStorage.setItem("dontAskAgain", "false");
      }
    }
  }, [open]);


  const excluirMotoboy = (nome) => {
    const atualizados = motoboys.filter((m) => m !== nome);
    setMotoboys(atualizados);
    sessionStorage.setItem("motoboys", JSON.stringify(atualizados));

    // se excluir o último selecionado
    const ultimo = sessionStorage.getItem("ultimoMotoboy");
    if (ultimo === nome) {
      sessionStorage.removeItem("ultimoMotoboy");
      sessionStorage.setItem("dontAskAgain", "false");
    }
  };

  // Selecionar
  const selecionarMotoboy = (nome) => {
    sessionStorage.setItem("ultimoMotoboy", nome);

    onSelect?.(nome);

    if (dontAskAgain) {
      sessionStorage.setItem("dontAskAgain", "true");
    }

    onClose();
  };

  // Adicionar novo motoboy
  const adicionarMotoboy = () => {
    if (!novoNome.trim()) return;

    const atualizados = [...motoboys, novoNome];
    setMotoboys(atualizados);
    sessionStorage.setItem("motoboys", JSON.stringify(atualizados));
    setNovoNome("");
  };



  // Checkbox
  const toggleDontAskAgain = (event) => {
    const checked = event.target.checked;
    setDontAskAgain(checked);
    sessionStorage.setItem("dontAskAgain", checked ? "true" : "false");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecionar Motoboy</DialogTitle>

      <DialogContent>
        {/* Adicionar novo */}
        <Box display="flex" gap={1} mb={2}>
          <TextField
            fullWidth
            size="small"
            label="Nome do motoboy"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <Button variant="contained" onClick={adicionarMotoboy}>
            Adicionar
          </Button>
        </Box>

        {/* Lista */}
        <List>
          {motoboys.map((nome) => (
            <ListItem key={nome} divider>
              <ListItemText primary={nome} />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => excluirMotoboy(nome)}
                  >
                    Excluir
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => selecionarMotoboy(nome)}
                  >
                    Selecionar
                  </Button>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Opção */}
        <FormControlLabel
          control={
            <Checkbox
              checked={dontAskAgain}
              onChange={toggleDontAskAgain}
            />
          }
          label="Salvar motoboy selecionado e não perguntar novamente"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}