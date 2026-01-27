import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Toolbar,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { useLoja } from "../../contexts/LojaContext";
import { useProducts } from "../../contexts/ProdutosContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function EditCategoria() {

  const [suportaExtra, setSuportaExtra] = useState(false);
  const [suportaBorda, setSuportaBorda] = useState(false);

  const { idLoja } = useLoja();
  const { categorias, setCategorias } = useProducts();
  const { categoriaId } = useParams(); // pega o id da URL
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [permiteMisto, setPermiteMisto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [extras, setExtras] = useState([]);
  const [bordas, setBordas] = useState([]);

  const [novoExtraNome, setNovoExtraNome] = useState("");
  const [novoExtraValor, setNovoExtraValor] = useState("");

  const [novaBordaNome, setNovaBordaNome] = useState("");
  const [novaBordaValor, setNovaBordaValor] = useState("");

  // ------------------------------
  // Carregar categoria do context
  // ------------------------------
  useEffect(() => {
    if (!categoriaId || !categorias.length) return;

    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) {
      alert("Categoria não encontrada");
      navigate(-1); // volta se não encontrar
      return;
    }

    setNome(categoria.nome || "");
    setPermiteMisto(categoria.permiteMisto || false);
    setExtras(categoria.extras || []);
    setBordas(categoria.bordas || []);
    setSuportaExtra((categoria.extras || []).length > 0);
    setSuportaBorda((categoria.bordas || []).length > 0);
  }, [categoriaId, categorias, navigate]);

  // ------------------------------
  // Helpers
  // ------------------------------
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
    if (!nomeExtra || isNaN(valorExtra)) return;

    const idExtra = gerarSlug(nomeExtra);
    setExtras(prev => [...prev, { id: idExtra, nome: nomeExtra, valor: valorExtra, status: true }]);
    setNovoExtraNome("");
    setNovoExtraValor("");
  };

  const removerExtra = (idExtra) => {
    setExtras(prev => prev.filter(e => e.id !== idExtra));
  };

  const adicionarBorda = () => {
    const nomeBorda = novaBordaNome.trim();
    const valorBorda = parseFloat(novaBordaValor);
    if (!nomeBorda || isNaN(valorBorda)) return;

    const idBorda = gerarSlug(nomeBorda);
    setBordas(prev => [...prev, { id: idBorda, nome: nomeBorda, valor: valorBorda, status: true }]);
    setNovaBordaNome("");
    setNovaBordaValor("");
  };

  const removerBorda = (idBorda) => {
    setBordas(prev => prev.filter(b => b.id !== idBorda));
  };

  // ------------------------------
  // Salvar alterações
  // ------------------------------
  const salvarCategoria = async () => {
    const nomeFinal = nome.trim();
    if (!nomeFinal) return;

    try {
      setLoading(true);
      const ref = doc(db, "clientes123pedidos", idLoja, "categorias", categoriaId);

      const categoriaAtualizada = {
        nome: nomeFinal,
        permiteMisto,
        status: true,
        extras,
        bordas,
        updatedAt: new Date(),
        id: categoriaId, // necessário para manter o id
      };

      await setDoc(ref, categoriaAtualizada);

      // Atualizar o estado do context
      setCategorias(prev => prev.map(c => c.id === categoriaId ? categoriaAtualizada : c));

      alert("Categoria atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar categoria");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // JSX
  // ------------------------------
  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Editar Categoria
        </Typography>

        <TextField
          label="Nome da categoria"
          fullWidth
          value={nome}
          onChange={e => setNome(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={permiteMisto}
              onChange={e => setPermiteMisto(e.target.checked)}
            />
          }
          label="Permitir produto (1/2) - indicado para pizzas e brotos"
        />

        <Divider sx={{ my: 2 }} />

        {/* Extras */}
        <FormControlLabel
          control={
            <Switch
              checked={suportaExtra}
              onChange={e => setSuportaExtra(e.target.checked)}
            />
          }
          label="Adicionar extras aos produtos desta categoria"
        />
        {suportaExtra && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth label="Nome do extra" value={novoExtraNome} onChange={e => setNovoExtraNome(e.target.value)} />
              <TextField fullWidth label="Valor" type="number" value={novoExtraValor} onChange={e => setNovoExtraValor(e.target.value)} />
              <Button fullWidth variant="contained" onClick={adicionarExtra}>Adicionar</Button>
            </Box>
            {extras.map(extra => (
              <Box key={extra.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography>{extra.nome} - R$ {extra.valor.toFixed(2)}</Typography>
                <IconButton onClick={() => removerExtra(extra.id)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Bordas */}
        <FormControlLabel
          control={
            <Switch
              checked={suportaBorda}
              onChange={e => setSuportaBorda(e.target.checked)}
            />
          }
          label="Adicionar bordas aos produtos desta categoria"
        />
        {suportaBorda && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth label="Nome da borda" value={novaBordaNome} onChange={e => setNovaBordaNome(e.target.value)} />
              <TextField fullWidth label="Valor" type="number" value={novaBordaValor} onChange={e => setNovaBordaValor(e.target.value)} />
              <Button fullWidth variant="contained" onClick={adicionarBorda}>Adicionar</Button>
            </Box>
            {bordas.map(borda => (
              <Box key={borda.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography>{borda.nome} - R$ {borda.valor.toFixed(2)}</Typography>
                <IconButton onClick={() => removerBorda(borda.id)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </>
        )}


        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
          onClick={salvarCategoria}
        >
          Salvar Alterações
        </Button>
      </Paper>
    </Box>
  );
}
