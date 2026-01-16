import { useState } from "react";

import {
  Box,
  TextField,
  Button,
  Toolbar,
  Typography
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { addProduto } from "../../services/produtos.service";

export default function AddBebida() {

  const [bebida, setBebida] = useState({
    nome: "",
    descricao: "",
    img: "",
    valor: ""
  });

  const salvarBebida = async () => {
    if (!bebida.nome || !bebida.valor) {
      alert("Preencha nome e valor");
      return;
    }

    const produto = {
      nome: bebida.nome,
      descricao: bebida.descricao,
      img: bebida.img,
      valor: Number(bebida.valor),
      tipo: "bebida",
      status: true
    };

    await addProduto(produto);

    setBebida({
      nome: "",
      descricao: "",
      img: "",
      valor: ""
    });

    alert("Bebida adicionada com sucesso!");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
      <Box
        component="img"
        src={bebida.img || null}
        sx={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          borderRadius: 2
        }}
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
        value={bebida.descricao}
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

      <Button variant="contained" onClick={salvarBebida}>
        Salvar Bebida
      </Button>
    </Box>
  );
}
