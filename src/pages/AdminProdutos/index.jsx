import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Toolbar,
  Avatar,
  Card,
  Switch,
  Button
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import { useProducts } from "../../contexts/ProdutosContext";
import {
  updateProdutoStatusBatch,
  deleteProduto,
} from "../../services/produtos.service";


import ConfirmDialog from "../../components/ConfirmDialog";
import ProductMenu from "../../components/MenuOptions";

export default function AdminProdutos() {
  const navigate = useNavigate();
  const { produtos, loading } = useProducts();

  const [produtosOriginais, setProdutosOriginais] = useState([]);
  const [cloneProdutos, setCloneProdutos] = useState([]);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  /* ---------- EXCLUIR ---------- */
  const abrirConfirmacaoExcluir = (prod) => {
    setProdutoSelecionado(prod);
    setOpenConfirmDialog(true);
  };

  /* ---------- STATUS ---------- */
  const toggleStatus = (prod) => {
    setCloneProdutos((prev) =>
      prev.map((p) =>
        p.id === prod.id ? { ...p, status: !p.status } : p
      )
    );
  };

  const salvarStatus = async () => {
    const produtosAlterados = cloneProdutos.filter((prod) => {
      const original = produtosOriginais.find((p) => p.id === prod.id);
      return original && original.status !== prod.status;
    });

    if (!produtosAlterados.length) return;

    try {
      await updateProdutoStatusBatch(produtosAlterados);

      setProdutosOriginais(cloneProdutos.map((p) => ({ ...p })));
      console.log("Status atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  };

  const produtosPorTipo = cloneProdutos.reduce((acc, prod) => {
    if (!acc[prod.tipo]) {
      acc[prod.tipo] = [];
    }
    acc[prod.tipo].push(prod);
    return acc;
  }, {});


  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!produtos.length || cloneProdutos.length) return;

    setProdutosOriginais(produtos.map((p) => ({ ...p })));
    setCloneProdutos(produtos.map((p) => ({ ...p })));
  }, [produtos]);

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Gestão de Produtos
      </Typography>

      {loading && <CircularProgress sx={{ mt: 3 }} />}

      {/* ---------- LISTA ---------- */}


      {Object.entries(produtosPorTipo).map(([tipo, produtos]) => (
        <Box key={tipo} sx={{ mb: 4 }}>
          {/* ---------- TÍTULO DA SEÇÃO ---------- */}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, textTransform: "capitalize" }}
          >
           {`${tipo}s`}
          </Typography>

          {/* ---------- GRID ---------- */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2
            }}
          >
            {produtos.map((prod) => (
              <Card
                key={prod.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1
                }}
              >
                {/* IMAGEM */}
                <Avatar
                  src={prod.img}
                  variant="rounded"
                  sx={{
                    width: "100%",
                    height: 140,
                    mb: 1
                  }}
                />

                {/* INFO */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight="bold">
                    {prod.nome}
                  </Typography>

                  {prod.descricao && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {prod.descricao}
                    </Typography>
                  )}

                  <Typography fontWeight="bold">
                    R$ {Number(prod.valor).toFixed(2)}
                  </Typography>
                </Box>

                {/* STATUS */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch
                      checked={Boolean(prod.status)}
                      onChange={() => toggleStatus(prod)}
                    />
                    <Typography
                      variant="caption"
                      color={prod.status ? "success.main" : "error.main"}
                    >
                      {prod.status ? "Ativo" : "Inativo"}
                    </Typography>
                  </Box>

                  <ProductMenu
                    onEdit={() => navigate(`/editproduto/${prod.id}`)}
                    onDelete={() => abrirConfirmacaoExcluir(prod)}
                  />
                </Box>
              </Card>
            ))}

          </Box>
        </Box>
      ))}

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        fullWidth
        onClick={salvarStatus}
      >
        Salvar status dos Produtos
      </Button>

      {/* ---------- CONFIRMAÇÃO ---------- */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${produtoSelecionado?.nome}"?`}
        funcao={async () => {
          if (!produtoSelecionado) return;

          await deleteProduto(produtoSelecionado.id);

          // 🔥 REMOVE DO ESTADO LOCAL
          setCloneProdutos((prev) =>
            prev.filter((p) => p.id !== produtoSelecionado.id)
          );

          setProdutosOriginais((prev) =>
            prev.filter((p) => p.id !== produtoSelecionado.id)
          );

          setOpenConfirmDialog(false);
        }}
      />
    </Box>
  );
}
