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
  const { idLoja } = useLoja();
  const { categorias, setCategorias } = useProducts();
  const { categoriaId } = useParams(); // pega o id da URL
  const navigate = useNavigate();

  const [suportaExtra, setSuportaExtra] = useState(false);
  const [suportaBorda, setSuportaBorda] = useState(false);
  const [novoExtraNome, setNovoExtraNome] = useState("");
  const [novoExtraValor, setNovoExtraValor] = useState("");
  const [novaBordaNome, setNovaBordaNome] = useState("");
  const [novaBordaValor, setNovaBordaValor] = useState("");

  const [categoria, setCategoria] = useState({
    nome: "",
    permiteMisto: false,
    status: true,
    limiteExtras: 5,
    extras: [],
    bordas: [],
    createdAt: null
  });

  const [loading, setLoading] = useState(false);

  // Carregar categoria do context
  useEffect(() => {
    if (!categoriaId || !categorias.length) return;

    const encontrada = categorias.find(c => c.id === categoriaId);

    if (!encontrada) {
      alert("Categoria não encontrada");
      navigate(-1);
      return;
    }

    setCategoria(encontrada);
    setSuportaExtra((encontrada.extras || []).length > 0);
    setSuportaBorda((encontrada.bordas || []).length > 0);
  }, [categoriaId, categorias, navigate]);


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
    const nome = novoExtraNome.trim();
    const valor = parseFloat(novoExtraValor);
    if (!nome || isNaN(valor)) return;

    const id = gerarSlug(nome);

    setCategoria(prev => ({
      ...prev,
      extras: [...prev.extras, { id, nome, valor, status: true }]
    }));

    setNovoExtraNome("");
    setNovoExtraValor("");
  };

  const removerExtra = (id) => {
    setCategoria(prev => ({
      ...prev,
      extras: prev.extras.filter(e => e.id !== id)
    }));
  };


  const adicionarBorda = () => {
    const nome = novaBordaNome.trim();
    const valor = parseFloat(novaBordaValor);
    if (!nome || isNaN(valor)) return;

    const id = gerarSlug(nome);

    setCategoria(prev => ({
      ...prev,
      bordas: [...prev.bordas, { id, nome, valor, status: true }]
    }));

    setNovaBordaNome("");
    setNovaBordaValor("");
  };

  const removerBorda = (id) => {
    setCategoria(prev => ({
      ...prev,
      bordas: prev.bordas.filter(b => b.id !== id)
    }));
  };


  // Salvar alterações
  const salvarCategoria = async () => {
    const nomeFinal = categoria.nome.trim();
    if (!nomeFinal) return;

    try {
      setLoading(true);

      const ref = doc(
        db,
        "clientes123pedidos",
        idLoja,
        "categorias",
        categoriaId
      );

      const payload = {
        ...categoria,
        updatedAt: new Date()
      };

      await setDoc(ref, payload);

      setCategorias(prev =>
        prev.map(c => (c.id === categoriaId ? { id: categoriaId, ...payload } : c))
      );

      alert("Categoria atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar categoria");
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
          Editar Categoria
        </Typography>

        <TextField
          label="Nome da categoria"
          fullWidth
          value={categoria.nome}
          onChange={e =>
            setCategoria(prev => ({ ...prev, nome: e.target.value }))
          }
        />

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={categoria.permiteMisto}
              onChange={e =>
                setCategoria(prev => ({
                  ...prev,
                  permiteMisto: e.target.checked
                }))
              }
            />
          }
          label="Permitir produto (1/2) - indicado para pizzas e brotos"
        />

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
            {categoria.bordas.map(borda => (
              <Box key={borda.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography>{borda.nome} - R$ {borda.valor.toFixed(2)}</Typography>
                <IconButton onClick={() => removerBorda(borda.id)}><DeleteIcon /></IconButton>
              </Box>
            ))}
          </>
        )}

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
            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
              <Typography>Ajuste o limite de extras para produtos nessa categoria</Typography>
              <TextField fullWidth label="limiteExtras" type="number" value={categoria.limiteExtras}
                onChange={(e) => {
                  const value = e.target.value
                  setCategoria(prev => ({
                    ...prev,
                    limiteExtras: value < 0 ? 0 : value,
                  }));
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth label="Nome do extra" value={novoExtraNome} onChange={e => setNovoExtraNome(e.target.value)} />
              <TextField fullWidth label="Valor" type="number" value={novoExtraValor} onChange={e => setNovoExtraValor(e.target.value)} />
              <Button fullWidth variant="contained" onClick={adicionarExtra}>Adicionar</Button>
            </Box>
            {categoria.extras.map(extra => (
              <Box key={extra.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography>{extra.nome} - R$ {extra.valor.toFixed(2)}</Typography>
                <IconButton onClick={() => removerExtra(extra.id)}><DeleteIcon /></IconButton>
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
