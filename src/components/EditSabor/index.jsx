import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Divider,
  Typography
} from "@mui/material";

import { updateProduto } from "../../services/produtos.service";

export default function EditSabor({ produto, onSaved }) {

  const [sabor, setSabor] = useState({
    nome: produto.nome || "",
    img: produto.img || "",
    descricao: produto.descricao || "",
    valor: produto.valor || ""
  });

  const salvar = async () => {
    if (!sabor.nome || sabor.valor === "") {
      alert("Preencha nome e valor");
      return;
    }

    await updateProduto(produto.id, {
      nome: sabor.nome,
      img: sabor.img,
      descricao: sabor.descricao,
      valor: Number(sabor.valor)
    });

    alert("Sabor atualizado com sucesso!");
    onSaved();
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Editar Sabor ({produto.tipo})
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="img"
          src={sabor.img || null}
          sx={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            borderRadius: 2
          }}
        />

        <TextField
          label="Sabor"
          value={sabor.nome}
          onChange={(e) =>
            setSabor(p => ({ ...p, nome: e.target.value }))
          }
        />

        <TextField
          label="Descrição"
          value={sabor.descricao}
          onChange={(e) =>
            setSabor(p => ({ ...p, descricao: e.target.value }))
          }
        />

        <TextField
          label={`Valor (${produto.tipo})`}
          type="number"
          value={sabor.valor}
          onChange={(e) =>
            setSabor(p => ({ ...p, valor: e.target.value }))
          }
        />

        <TextField
          label="Link da imagem"
          value={sabor.img}
          onChange={(e) =>
            setSabor(p => ({ ...p, img: e.target.value }))
          }
        />

        <Divider sx={{ my: 2 }} />

        <Button variant="contained" onClick={salvar}>
          Salvar Alterações
        </Button>
      </Box>
    </>
  );
}
