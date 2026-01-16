import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, TextField, Button, Toolbar, Typography } from "@mui/material";

import { useProducts } from "../../contexts/ProdutosContext";
import { updateProduto } from "../../services/produtos.service";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

const TIPOS_PRODUTO = [
  { id: "pizza", label: "Pizza" },
  { id: "broto", label: "Broto" },
  { id: "esfiha", label: "Esfiha" },
  { id: "bebida", label: "Bebida" }
];

export default function EditProduto() {
  const { IDproduto } = useParams();
  const navigate = useNavigate();

  const { produtos, loading } = useProducts();

  const [produtoAtualizado, setProdutoAtualizado] = useState(null);
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  /* ---------- BUSCA PRODUTO ---------- */
  useEffect(() => {
    if (loading || !produtos.length) return;

    const produtoEncontrado = produtos.find(
      (p) => p.id === IDproduto
    );

    if (produtoEncontrado) {
      setProdutoAtualizado({ ...produtoEncontrado });
      setTipoSelecionado(produtoEncontrado.tipo);
    }
  }, [IDproduto, produtos, loading]);

  if (loading || !produtoAtualizado) {
    return (
      <Box sx={{ p: 2 }}>
        <Navbar />
        <Toolbar />
        <Typography>Carregando produto...</Typography>
      </Box>
    );
  }

  /* ---------- SALVAR ---------- */
  const salvarEdicao = async () => {
    if (!produtoAtualizado.nome || produtoAtualizado.valor === "") {
      alert("Preencha nome e valor");
      return;
    }

    const dados = {
      ...produtoAtualizado,
      valor: Number(produtoAtualizado.valor),
      tipo: tipoSelecionado
    };


    try {
      await updateProduto(produtoAtualizado.id, dados);
      navigate("/produtos");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Editar Produto
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="img"
          src={produtoAtualizado.img}
          sx={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            borderRadius: 2
          }}
        />

        {/* ---------- TIPO ---------- */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {TIPOS_PRODUTO.map((tipo) => (
            <Button
              key={tipo.id}
              fullWidth
              variant={tipoSelecionado === tipo.id ? "contained" : "outlined"}
              onClick={() => {
                setTipoSelecionado(tipo.id);
                setProdutoAtualizado((p) => ({
                  ...p,
                  tipo: tipo.id
                }));
              }}
            >
              {tipo.label}
            </Button>
          ))}
        </Box>

        <TextField
          label="Nome"
          value={produtoAtualizado.nome}
          onChange={(e) =>
            setProdutoAtualizado((p) => ({
              ...p,
              nome: e.target.value
            }))
          }
        />

        <TextField
          label="Descrição"
          value={produtoAtualizado.descricao || ""}
          onChange={(e) =>
            setProdutoAtualizado((p) => ({
              ...p,
              descricao: e.target.value
            }))
          }
        />

        <TextField
          label="Valor"
          type="number"
          value={produtoAtualizado.valor}
          onChange={(e) =>
            setProdutoAtualizado((p) => ({
              ...p,
              valor: e.target.value
            }))
          }
        />

        <TextField
          label="Link da imagem"
          value={produtoAtualizado.img}
          onChange={(e) =>
            setProdutoAtualizado((p) => ({
              ...p,
              img: e.target.value
            }))
          }
        />

        <Button
          variant="contained"
          onClick={salvarEdicao}
          disabled={loading}
        >
          Atualizar Produto
        </Button>
      </Box>
    </Box>
  );
}
