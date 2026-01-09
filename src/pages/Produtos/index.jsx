import { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Toolbar,
  Avatar,
  Card,
  Switch,
  IconButton,
  Collapse,
  Button,
  TextField
} from "@mui/material";
import { Edit, Close } from "@mui/icons-material";

import Navbar from "../../components/Navbar";
import { useProducts } from "../../contexts/ProdutosContext";
import { addPizza, updatePizza, deletePizza } from "../../services/pizzas.service";
import { addBebida, updateBebida, deleteBebida } from "../../services/bebidas.service";

export default function AdminProdutos() {
  const { produtos, loading, reloadProdutos } = useProducts();


  const [openCriar, setOpenCriar] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    ingredientes: "",
    img: "",
    valor: ""
  });

  const [editProduto, setEditProduto] = useState({});

  const abrirEdicao = (prod) => {
    setEditandoId(prod.id);
    setEditProduto({ ...prod });
  };

  const fecharEdicao = () => {
    setEditandoId(null);
    setEditProduto({});
  };


  const salvarNovoProduto = async () => {
    const produto = {
      ...novoProduto,
      valor: Number(novoProduto.valor),
      status: true
    };

    if (produto.tipo === "pizza") {
      await addPizza(produto);
    } else if (produto.tipo === "bebida") {
      await addBebida(produto);
    } else {
      alert("Tipo inválido");
      return;
    }

    setNovoProduto({
      nome: "",
      descricao: "",
      tipo: "",
      ingredientes: "",
      img: "",
      valor: ""
    });

    setOpenCriar(false);
    reloadProdutos();
  }

  const salvarEdicao = async () => {
    const dados = {
      nome: editProduto.nome,
      descricao: editProduto.descricao,
      valor: Number(editProduto.valor),
      img: editProduto.img
    };

    if (editProduto.tipo === "pizza") {
      await updatePizza(editProduto.id, dados);
    } else {
      await updateBebida(editProduto.id, dados);
    }

    fecharEdicao();
    reloadProdutos();
  };

  const excluirProduto = async (prod) => {
    if (!window.confirm("Deseja excluir?")) return;

    if (prod.tipo === "pizza") {
      await deletePizza(prod.id);
    } else {
      await deleteBebida(prod.id);
    }

    reloadProdutos();
  };


  const toggleStatus = async (prod) => {
    const novoStatus = !prod.status;

    if (prod.tipo === "pizza") {
      await updatePizza(prod.id, { status: novoStatus });
    } else {
      await updateBebida(prod.id, { status: novoStatus });
    }

    reloadProdutos();
  };



  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Gestão de Produtos
      </Typography>

      {/* ---------- CRIAR ---------- */}
      <Box sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setOpenCriar(!openCriar)}
        >
          Adicionar Produto {openCriar ? "▲" : "▼"}
        </Button>

        <Collapse in={openCriar}>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            {novoProduto.img && (
              <Box
                component="img"
                src={novoProduto.img}
                sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
              />
            )}

            <TextField
              label="Nome"
              value={novoProduto.nome}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, nome: e.target.value }))
              }
            />

            <TextField
              label="Descrição"
              value={novoProduto.descricao}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, descricao: e.target.value }))
              }
            />

            <TextField
              label="Tipo (pizza | bebida)"
              value={novoProduto.tipo}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, tipo: e.target.value }))
              }
            />

            <TextField
              label="Ingredientes"
              value={novoProduto.ingredientes}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, ingredientes: e.target.value }))
              }
            />

            <TextField
              label="Link da imagem"
              value={novoProduto.img}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, img: e.target.value }))
              }
            />

            <TextField
              label="Valor"
              type="number"
              value={novoProduto.valor}
              onChange={(e) =>
                setNovoProduto((p) => ({ ...p, valor: e.target.value }))
              }
            />

            <Button variant="contained" onClick={salvarNovoProduto}>
              Salvar Produto
            </Button>

          </Box>
        </Collapse>
      </Box>

      {loading && <CircularProgress sx={{ mt: 3 }} />}

      {/* ---------- LISTA ---------- */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2
        }}
      >
        {produtos.map((prod) => (
          <Card key={prod.id} sx={{ p: 1.5, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={prod.img} variant="rounded" />

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight="bold">{prod.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {prod.descricao}
                </Typography>
              </Box>

              {
                editandoId === null ?
                  (<IconButton onClick={() => abrirEdicao(prod)}>
                    <Edit />
                  </IconButton>
                  ) : (
                    <IconButton size="small" onClick={fecharEdicao}>
                      <Close />
                    </IconButton>
                  )
              }

              <Switch
                checked={prod.status}
                onChange={() => toggleStatus(prod)}
              />

            </Box>

            {/* ---------- EDITAR ---------- */}
            <Collapse in={editandoId === prod.id}>
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography fontWeight="bold">Editar</Typography>

                {editProduto.img && (
                  <Box
                    component="img"
                    src={editProduto.img}
                    sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
                  />
                )}

                <TextField
                  label="Nome"
                  value={editProduto.nome || ""}
                  onChange={(e) =>
                    setEditProduto((p) => ({ ...p, nome: e.target.value }))
                  }
                />

                <TextField
                  label="Descrição"
                  value={editProduto.descricao || ""}
                  onChange={(e) =>
                    setEditProduto((p) => ({ ...p, descricao: e.target.value }))
                  }
                />

                <TextField
                  label="Valor"
                  type="number"
                  value={editProduto.valor || ""}
                  onChange={(e) =>
                    setEditProduto((p) => ({ ...p, valor: e.target.value }))
                  }
                />

                <Button variant="contained" onClick={salvarEdicao}>
                  Salvar Alterações
                </Button>

              </Box>
            </Collapse>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
