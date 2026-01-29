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
  IconButton,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import { useProducts } from "../../contexts/ProdutosContext";

export default function AddCategoria() {
  const { addCategoria } = useProducts();
  const { idLoja } = useLoja();

  // estados temporários (inputs)
  const [suportaExtra, setSuportaExtra] = useState(false);
  const [suportaBorda, setSuportaBorda] = useState(false);
  const [novoExtraNome, setNovoExtraNome] = useState("");
  const [novoExtraValor, setNovoExtraValor] = useState(0);
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
    if (!nome || isNaN(valor)) return alert("Extra inválido");

    const id = gerarSlug(nome);

    setCategoria(prev => ({
      ...prev,
      extras: [...prev.extras, { id, nome, valor, status: true }],
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
    if (!nome || isNaN(valor)) return alert("Borda inválida");

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


  const salvarCategoria = async () => {
    const nomeFinal = categoria.nome.trim();
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

      const snap = await getDoc(ref);
      if (snap.exists()) {
        alert("Já existe uma categoria com esse nome");
        return;
      }

      const payload = {
        ...categoria,
        createdAt: new Date()
      };

      await setDoc(ref, payload);
      addCategoria({ id: idCategoria, ...payload });

      setCategoria({
        nome: "",
        permiteMisto: false,
        status: true,
        extras: [],
        bordas: [],
        createdAt: null
      });

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
          label="Adicionar bordas aos produtos desta categoria - indicado para pizzas e brotos"
        />
        {suportaBorda && (
          <>

            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
              <TextField fullWidth label="Nome da borda" value={novaBordaNome} onChange={e => setNovaBordaNome(e.target.value)} />
              <TextField fullWidth label="Valor" type="number" value={novaBordaValor}
                onChange={(e) => {
                  if (e.target.value < 0) {
                    setNovaBordaValor(0)
                  }
                  setNovaBordaValor(e.target.value)
                }}
              />
              <Button
                disabled={!novaBordaNome && !novaBordaValor}
                fullWidth
                variant="contained"
                onClick={adicionarBorda}
              >
                Adicionar
              </Button>
            </Box>

            {categoria.bordas.map(borda => (
              <Box key={borda.id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
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

            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
              <TextField fullWidth label="Nome do extra" value={novoExtraNome} onChange={e => setNovoExtraNome(e.target.value)} />
              <TextField fullWidth label="Valor" type="number" value={novoExtraValor}
                onChange={(e) => {
                  if (e.target.value < 0) {
                    setNovoExtraValor(0)
                  }
                  setNovoExtraValor(e.target.value)
                }}
              />
              <Button
                disabled={!novoExtraNome.trim() || novoExtraValor <= 0}
                fullWidth variant="contained"
                onClick={adicionarExtra}
              >
                Adicionar
              </Button>
            </Box>

            {categoria.extras.map(extra => (
              <Box key={extra.id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
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
          disabled={
            loading ||
            !categoria.nome.trim() ||
            (suportaExtra && categoria.extras.length === 0) ||
            (suportaBorda && categoria.bordas.length === 0)
          }
          onClick={salvarCategoria}
        >
          Salvar Categoria
        </Button>
      </Paper>
    </Box>
  );
}
