import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, TextField, Button, Toolbar, Typography } from "@mui/material";

import { useProducts } from "../../contexts/ProdutosContext";
import { updateProduto } from "../../services/produtos.service";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

export default function EditProduto() {
  const { IDproduto } = useParams();
  const navigate = useNavigate();

  const { produtos, loading } = useProducts();

  const [produtoAtualizado, setProdutoAtualizado] = useState(null);
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  const tipos = ["pizza", "bebida"];

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
    if (!produtoAtualizado.nome || !produtoAtualizado.valor) {
      alert("Preencha nome e valor");
      return;
    }

    const dados = {
      ...produtoAtualizado,
      valor: Number(produtoAtualizado.valor),
    };

    // remove ingredientes se não for pizza
    if (dados.tipo !== "pizza") {
      delete dados.ingredientes;
    }

    try {
      await updateProduto(produtoAtualizado.id, dados);
      navigate("/produtos");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
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
          {tipos.map((tipo) => (
            <Button
              key={tipo}
              fullWidth
              variant={tipoSelecionado === tipo ? "contained" : "outlined"}
              onClick={() => {
                setTipoSelecionado(tipo);
                setProdutoAtualizado((p) => ({
                  ...p,
                  tipo,
                  ...(tipo !== "pizza" ? { ingredientes: "" } : {})
                }));
              }}
            >
              {tipo}
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
          value={produtoAtualizado.descricao}
          onChange={(e) =>
            setProdutoAtualizado((p) => ({
              ...p,
              descricao: e.target.value
            }))
          }
        />

        {tipoSelecionado === "pizza" && (
          <TextField
            label="Ingredientes"
            value={produtoAtualizado.ingredientes || ""}
            onChange={(e) =>
              setProdutoAtualizado((p) => ({
                ...p,
                ingredientes: e.target.value
              }))
            }
          />
        )}

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

        <Button variant="contained" onClick={salvarEdicao}>
          Atualizar Produto
        </Button>
      </Box>
    </Box>
  );
}
