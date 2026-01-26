import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { db } from "../../config/firebase";
import { useLoja } from "../../contexts/LojaContext";

import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Toolbar,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

export default function AddCategoria() {
  const { idLoja } = useLoja();

  const [nome, setNome] = useState("");
  const [permiteMisto, setPermiteMisto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [extras, setExtras] = useState([]);
  const [novoExtraNome, setNovoExtraNome] = useState("");
  const [novoExtraValor, setNovoExtraValor] = useState("");

  function gerarSlug(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  }

  const adicionarExtra = () => {
    const nomeExtra = novoExtraNome.trim();
    const valorExtra = parseFloat(novoExtraValor);

    if (!nomeExtra || isNaN(valorExtra)) {
      alert("Preencha nome e valor válidos para o extra");
      return;
    }

    const idExtra = gerarSlug(nomeExtra);

    setExtras(prev => [...prev, { nome: nomeExtra, valor: valorExtra, id: idExtra, status: true }]);
    setNovoExtraNome("");
    setNovoExtraValor("");
  };

  const removerExtra = (idExtra) => {
    setExtras(prev => prev.filter(e => e.id !== idExtra));
  };

  const salvarCategoria = async () => {
    const nomeFinal = nome.trim();
    if (!nomeFinal) return;

    const idCategoria = gerarSlug(nomeFinal);

    try {
      setLoading(true);

      const ref = doc(
        db,
        "clientes123pedidos",
        idLoja,
        "categorias",
        idCategoria
      );

      const existe = await getDoc(ref);
      if (existe.exists()) {
        alert("Já existe uma categoria com esse nome");
        throw new Error("CATEGORIA_DUPLICADA");
      }

      await setDoc(ref, {
        nome: nomeFinal,
        permiteMisto,
        status: true,
        extras, // aqui adicionamos os extras
        createdAt: new Date()
      });

      setNome("");
      setPermiteMisto(false);
      setExtras([]);
      alert("Categoria criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nova Categoria
        </Typography>

        <TextField
          label="Nome da categoria"
          fullWidth
          value={nome}
          onChange={e => setNome(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={permiteMisto}
              onChange={e => setPermiteMisto(e.target.checked)}
            />
          }
          label="Permitir produto misto (1/2)"
        />

        <Typography variant="subtitle1" sx={{ mt: 3 }}>
          Extras
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="Nome do extra"
            value={novoExtraNome}
            onChange={e => setNovoExtraNome(e.target.value)}
          />
          <TextField
            label="Valor"
            type="number"
            value={novoExtraValor}
            onChange={e => setNovoExtraValor(e.target.value)}
          />
          <Button variant="contained" onClick={adicionarExtra}>Adicionar</Button>
        </Box>

        {extras.map(extra => (
          <Box
            key={extra.id}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}
          >
            <Typography>{extra.nome} - R$ {extra.valor.toFixed(2)}</Typography>
            <IconButton onClick={() => removerExtra(extra.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
          onClick={salvarCategoria}
        >
          Salvar Categoria
        </Button>
      </Paper>
    </Box>
  );
}
