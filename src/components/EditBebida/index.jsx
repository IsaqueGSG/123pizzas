import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { updateProduto } from "../../services/produtos.service";

export default function EditBebida({ produto, onSaved }) {
  const [bebida, setBebida] = useState({ ...produto });

  const salvar = async () => {
    if (!bebida.nome || bebida.valor === "") {
      alert("Preencha nome e valor");
      return;
    }

    await updateProduto(bebida.id, {
      nome: bebida.nome,
      descricao: bebida.descricao,
      img: bebida.img,
      valor: Number(bebida.valor)
    });

    alert("Bebida atualizada!");
    onSaved();
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Editar Bebida
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="img"
          src={bebida.img}
          sx={{ height: 160, objectFit: "cover", borderRadius: 2 }}
        />

        <TextField
          label="Nome"
          value={bebida.nome}
          onChange={(e) =>
            setBebida(p => ({ ...p, nome: e.target.value }))
          }
        />

        <TextField
          label="Descrição"
          value={bebida.descricao || ""}
          onChange={(e) =>
            setBebida(p => ({ ...p, descricao: e.target.value }))
          }
        />

        <TextField
          label="Valor"
          type="number"
          value={bebida.valor}
          onChange={(e) =>
            setBebida(p => ({ ...p, valor: e.target.value }))
          }
        />

        <TextField
          label="Link da imagem"
          value={bebida.img}
          onChange={(e) =>
            setBebida(p => ({ ...p, img: e.target.value }))
          }
        />

        <Button variant="contained" onClick={salvar}>
          Salvar Alterações
        </Button>
      </Box>
    </>
  );
}
