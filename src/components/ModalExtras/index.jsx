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
import { useState, useEffect, useMemo } from "react";

export default function ModalExtras({
  open,
  onClose,
  produto,
  onConfirm
}) {

  const [selecoes, setSelecoes] = useState({});
  const [observacao, setObservacao] = useState("");
  const [alertasAtivos, setAlertasAtivos] = useState({});

  useEffect(() => {
    if (!open) {
      setSelecoes({});
      setObservacao("");
    }
  }, [open]);

  const toggleItem = (grupoId, item) => {
    const grupo = produto.categoria.gruposExtras.find(g => g.id === grupoId);
    const itens = selecoes[grupoId] || [];

    const jaSelecionado = itens.some(i => i.id === item.id);

    // reset alerta ao interagir
    setAlertasAtivos(prev => ({
      ...prev,
      [grupoId]: false
    }));

    // remover
    if (jaSelecionado) {
      setSelecoes(prev => ({
        ...prev,
        [grupoId]: itens.filter(i => i.id !== item.id)
      }));
      return;
    }

    // 🚨 BLOQUEIO DE LIMITE
    if (itens.length >= grupo.limite) {
      if (!alertasAtivos[grupoId]) {
        alert(`Máximo de ${grupo.limite} em ${grupo.nome}`);

        setAlertasAtivos(prev => ({
          ...prev,
          [grupoId]: true
        }));
      }
      return;
    }

    // adicionar
    setSelecoes(prev => ({
      ...prev,
      [grupoId]: [...itens, item]
    }));
  };

  const validarMinimos = () => {
    for (const grupo of produto.categoria.gruposExtras || []) {
      const selecionados = selecoes[grupo.id] || [];

      if (selecionados.length < grupo.minimo) {
        alert(`Selecione pelo menos ${grupo.minimo} item(ns) em ${grupo.nome}`);
        return false;
      }
    }
    return true;
  };

  const podeConfirmar = produto?.categoria?.gruposExtras?.every(grupo => {
    const selecionados = selecoes[grupo.id] || [];
    return (selecionados.length >= grupo.minimo);
  });

  const callback_confirmarFlagsAntigas = (
        // exemplo de categoria antiga:
    // {
    //   "id": "q6U9IHkhyiQgCo4EHwrw",
    //     "status": true,
    //       "horarioFuncionamento": {
    //     "fim": "01:00",
    //       "inicio": "18:00"
    //   },
    //   "extras": [],
    //     "createdAt": 1771708150304,
    //       "limiteExtras": 5,
    //         "permiteMisto": true,
    //           "posicao": 4,
    //             "nome": "Broto - 4 pedaços",
    //               "updatedAt": {
    //     "type": "firestore/timestamp/1.0",
    //       "seconds": 1775879445,
    //         "nanoseconds": 198000000
    //   },
    //   "bordas": []
    // }

    produto?.categoria?.extras !== null ||  produto?.categoria?.bordas !== null 
  ) 

  const selecionarUnico = (grupoId, itemId) => {
    const grupo = produto?.categoria?.gruposExtras?.find(g => g.id === grupoId);
    if (!grupo) return;

    const item = grupo.itens.find(i => i.id === itemId);

    setSelecoes(prev => ({
      ...prev,
      [grupoId]: item ? [item] : []
    }));
  };


  const precoExtras = Object.values(selecoes)
    .flat()
    .reduce((total, item) => total + (item.valor || 0), 0);

  const precoFinal = (produto?.valor || 0) + precoExtras;

  const gruposOrdenados = useMemo(() => {
    return [...(produto?.categoria?.gruposExtras || [])].sort((a, b) => {
      if (a.limite === 1 && b.limite !== 1) return -1;
      if (a.limite !== 1 && b.limite === 1) return 1;
      return (b.minimo || 0) - (a.minimo || 0);
    });
  }, [produto]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{produto.nome}</DialogTitle>

      <DialogContent>
        {/* Extras */}

        {gruposOrdenados.map(grupo => {
          const selecionados = selecoes[grupo.id] || [];

          // 🔥 CASO 1: limite === 1 → SELECT
          if (grupo.limite === 1) {
            return (
              <FormControl fullWidth sx={{ mb: 2 }} key={grupo.id}>
                <InputLabel>{grupo.nome}</InputLabel>
                <Select
                  renderValue={(selected) => {
                    const item = grupo.itens.find(i => i.id === selected);

                    if (!item) return "Selecionar";

                    return `${item.nome} ${item.valor > 0 ? `(+R$ ${item.valor.toFixed(2)})` : ""
                      }`;
                  }}
                  value={selecionados[0]?.id || ""}
                  label={grupo.nome}
                  onChange={(e) => selecionarUnico(grupo.id, e.target.value)}
                >
                  {/* opção vazia se mínimo = 0 */}
                  {grupo.minimo === 0 && (
                    <MenuItem value="">
                      Nenhum
                    </MenuItem>
                  )}

                  {grupo.itens.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.nome}
                      {item.valor > 0 && ` (+R$ ${item.valor.toFixed(2)})`}
                    </MenuItem>
                  ))}
                </Select>

                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  {grupo.minimo > 0 && `Selecione ${grupo.minimo}`}
                </Typography>
              </FormControl>
            );
          }

          // 🔥 CASO 2: múltipla escolha (botões)
          return (
            <Box key={grupo.id} sx={{ mb: 2 }}>
              <Typography fontWeight="bold">
                {grupo.nome} ({selecionados.length}/{grupo.limite})
                {grupo.minimo > 0 && ` • mínimo ${grupo.minimo}`}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {grupo.itens.map(item => {
                  const ativo = selecionados.some(i => i.id === item.id);

                  return (
                    <Button
                      key={item.id}
                      variant={ativo ? "contained" : "outlined"}
                      onClick={() => toggleItem(grupo.id, item)}
                    >
                      {item.nome}
                      {item.valor > 0 && ` (+R$ ${item.valor})`}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          );
        })}

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
          disabled={!podeConfirmar || callback_confirmarFlagsAntigas}
          onClick={() => {
            if (!validarMinimos()) return;

            onConfirm({
              selecoes,
              observacao,
              precoFinal
            });
          }}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
