import { useState } from "react";
import {
  Box,
  TextField,
  Button
} from "@mui/material";

import { addProduto } from "../../services/produtos.service";

export default function AddExtra() {
  const [extra, setExtra] = useState({
    nome: "",
    valor: ""
  });

  const salvarExtra = async () => {
    if (!extra.nome || !extra.valor) {
      alert("Preencha nome e valor");
      return;
    }

    const produto = {
      nome: extra.nome,
      valor: Number(extra.valor),
      tipo: "extra",
      status: true
    };

    await addProduto(produto);

    setExtra({ nome: "", valor: "" });
    alert("Extra adicionado com sucesso!");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
      <TextField
        label="Nome do extra"
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

      <Button variant="contained" onClick={salvarExtra}>
        Salvar Extra
      </Button>
    </Box>
  );
}
