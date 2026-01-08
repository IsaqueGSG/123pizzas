import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper
} from "@mui/material";

// import { criarProduto } from "../services/produtosService";

const criarProduto = ()=>{}

export default function AdminProdutos() {
  const clienteId = "chavao"; // depois pode vir do auth ou params

  const [tipo, setTipo] = useState("pizza");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [img, setImg] = useState("");

  // preços
  const [precoFamilia, setPrecoFamilia] = useState("");
  const [precoBroto, setPrecoBroto] = useState("");
  const [valorBebida, setValorBebida] = useState("");

  const salvar = async () => {
    if (!nome) {
      alert("Informe o nome");
      return;
    }

    let produto = {
      nome,
      descricao,
      img,
      tipo
    };

    if (tipo === "pizza") {
      produto.precos = {
        familia: Number(precoFamilia),
        broto: Number(precoBroto)
      };
    }

    if (tipo === "bebida") {
      produto.valor = Number(valorBebida);
    }

    await criarProduto(clienteId, produto);

    alert("Produto cadastrado!");

    // reset
    setNome("");
    setDescricao("");
    setImg("");
    setPrecoFamilia("");
    setPrecoBroto("");
    setValorBebida("");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cadastro de Produto
        </Typography>

        <TextField
          select
          label="Tipo"
          fullWidth
          sx={{ mb: 2 }}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <MenuItem value="pizza">Pizza</MenuItem>
          <MenuItem value="bebida">Bebida</MenuItem>
        </TextField>

        <TextField
          label="Nome"
          fullWidth
          sx={{ mb: 2 }}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <TextField
          label="Descrição"
          fullWidth
          sx={{ mb: 2 }}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <TextField
          label="Imagem (URL)"
          fullWidth
          sx={{ mb: 2 }}
          value={img}
          onChange={(e) => setImg(e.target.value)}
        />

        {/* -------- PIZZA -------- */}
        {tipo === "pizza" && (
          <>
            <TextField
              label="Preço Família"
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              value={precoFamilia}
              onChange={(e) => setPrecoFamilia(e.target.value)}
            />

            <TextField
              label="Preço Broto"
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              value={precoBroto}
              onChange={(e) => setPrecoBroto(e.target.value)}
            />
          </>
        )}

        {/* -------- BEBIDA -------- */}
        {tipo === "bebida" && (
          <TextField
            label="Preço"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={valorBebida}
            onChange={(e) => setValorBebida(e.target.value)}
          />
        )}

        <Button fullWidth variant="contained" onClick={salvar}>
          Salvar Produto
        </Button>
      </Paper>
    </Box>
  );
}
