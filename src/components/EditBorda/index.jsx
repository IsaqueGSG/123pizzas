import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { updateProduto } from "../../services/produtos.service";

import { useLoja } from "../../contexts/LojaContext";

export default function EditBorda({ produto, onSaved }) {
  const { idLoja } = useLoja()

  const [borda, setBorda] = useState({ ...produto });

  const salvar = async () => {
    if (!borda.nome || borda.valor === "") {
      alert("Preencha nome e valor");
      return;
    }

    await updateProduto(idLoja, borda.id, {
      nome: borda.nome,
      valor: Number(borda.valor)
    });

    alert("Borda atualizada!");
    onSaved();
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Editar Borda
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          label="Nome"
          value={borda.nome}
          onChange={(e) =>
            setBorda(p => ({ ...p, nome: e.target.value }))
          }
        />

        <TextField
          label="Valor adicional"
          type="number"
          value={borda.valor}
          onChange={(e) =>
            setBorda(p => ({ ...p, valor: e.target.value }))
          }
        />

        <Button variant="contained" onClick={salvar}>
          Salvar Alterações
        </Button>
      </Box>
    </>
  );
}
