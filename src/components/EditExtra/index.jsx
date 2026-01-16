import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { updateProduto } from "../../services/produtos.service";

export default function EditExtra({ produto, onSaved }) {
  const [extra, setExtra] = useState({ ...produto });

  const salvar = async () => {
    if (!extra.nome || extra.valor === "") {
      alert("Preencha nome e valor");
      return;
    }

    await updateProduto(extra.id, {
      nome: extra.nome,
      valor: Number(extra.valor)
    });

    alert("Extra atualizado!");
    onSaved();
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Editar Extra
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          label="Nome"
          value={extra.nome}
          onChange={(e) =>
            setExtra(p => ({ ...p, nome: e.target.value }))
          }
        />

        <TextField
          label="Valor adicional"
          type="number"
          value={extra.valor}
          onChange={(e) =>
            setExtra(p => ({ ...p, valor: e.target.value }))
          }
        />

        <Button variant="contained" onClick={salvar}>
          Salvar Alterações
        </Button>
      </Box>
    </>
  );
}
