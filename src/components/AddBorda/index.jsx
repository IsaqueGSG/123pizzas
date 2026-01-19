import { useState } from "react";
import {
  Box,
  TextField,
  Button
} from "@mui/material";

import { addProduto } from "../../services/produtos.service";
import { useLoja } from "../../contexts/LojaContext";

export default function AddBorda() {
  const { idLoja } = useLoja()

  const [borda, setBorda] = useState({
    nome: "",
    valor: ""
  });

  const salvarBorda = async () => {
    if (!borda.nome || !borda.valor) {
      alert("Preencha nome e valor");
      return;
    }

    const produto = {
      nome: borda.nome,
      valor: Number(borda.valor),
      tipo: "borda",
      status: true
    };

    await addProduto(idLoja, produto);

    setBorda({ nome: "", valor: "" });
    alert("Borda adicionada com sucesso!");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
      <TextField
        label="Nome da borda"
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

      <Button variant="contained" onClick={salvarBorda}>
        Salvar Borda
      </Button>
    </Box>
  );
}
