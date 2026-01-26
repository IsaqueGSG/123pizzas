import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  MenuItem,
  Divider,
  Toolbar,
  Typography
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";
import { updateProduto } from "../../services/produtos.service";
import { getCategorias } from "../../services/categorias.service";

export default function EditProduto() {
  const { IDproduto } = useParams();
  const { produtos, loading } = useProducts();
  const { idLoja } = useLoja();

  const [produto, setProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    img: "",
    valor: 0,
    descricao: "",
    categoriaId: ""
  });

  // 🔹 carrega categorias
  useEffect(() => {
    getCategorias(idLoja).then(setCategorias);
  }, [idLoja]);

  // 🔹 busca o produto
  useEffect(() => {
    if (loading || !produtos.length) return;

    const encontrado = produtos.find(p => p.id === IDproduto);
    if (encontrado) setProduto(encontrado);
  }, [IDproduto, produtos, loading]);

  // 🔹 popula o formulário
  useEffect(() => {
    if (!produto) return;

    setForm({
      nome: produto.nome || "",
      img: produto.img || "",
      valor: produto.valor || 0,
      descricao: produto.descricao || "",
      categoriaId: produto.categoriaId || ""
    });
  }, [produto]);

  const salvar = async () => {
    const { nome, valor, categoriaId } = form;

    if (!nome.trim() || !categoriaId || valor <= 0) {
      alert("Preencha todos os campos corretamente");
      return;
    }

    await updateProduto(idLoja, produto.id, {
      nome: form.nome,
      img: form.img,
      valor: Number(form.valor),
      descricao: form.descricao,
      categoriaId: form.categoriaId
    });

    alert("Produto atualizado com sucesso!");
  };

  if (loading || !produto) {
    return (
      <Box sx={{ p: 2 }}>
        <Navbar />
        <Toolbar />
        <Typography>Carregando produto...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
        <TextField
          label="Nome"
          value={form.nome}
          onChange={e =>
            setForm(f => ({ ...f, nome: e.target.value }))
          }
        />

        <TextField
          label="Imagem (URL)"
          value={form.img}
          onChange={e =>
            setForm(f => ({ ...f, img: e.target.value }))
          }
        />

        <TextField
          label="Categoria"
          select
          value={form.categoriaId}
          onChange={e =>
            setForm(f => ({ ...f, categoriaId: e.target.value }))
          }
        >
          {categorias
            .filter(c => c.status)
            .map(cat => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nome}
              </MenuItem>
            ))}
        </TextField>

        <TextField
          label="Valor"
          type="number"
          value={form.valor}
          onChange={e =>
            setForm(f => ({ ...f, valor: e.target.value }))
          }
        />

        <TextField
          label="Descrição"
          multiline
          rows={3}
          value={form.descricao}
          onChange={e =>
            setForm(f => ({ ...f, descricao: e.target.value }))
          }
        />

        <Divider />

        <Button variant="contained" onClick={salvar}>
          Salvar Alterações
        </Button>
      </Box>
    </Box>
  );
}
