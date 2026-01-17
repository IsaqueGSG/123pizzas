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
  Button,
  Tabs,
  Tab
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

  const [abaAtiva, setAbaAtiva] = useState(0);

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

  const tipos = Object.keys(produtosPorTipo);



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

      <Tabs
        value={abaAtiva}
        onChange={(e, newValue) => setAbaAtiva(newValue)}
        sx={{ mb: 3 }}
        variant="fullWidth"
        scrollButtons="auto"
      >
        {tipos.map((tipo) => (
          <Tab
            key={tipo}
            label={tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          />
        ))}
      </Tabs>


      {/* ---------- LISTA ---------- */}
      {tipos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, textTransform: "capitalize" }}
          >
            {`${tipos[abaAtiva]}s`}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2
            }}
          >
            {produtosPorTipo[tipos[abaAtiva]]?.map((prod) => (
              <Card key={prod.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    gap: 1.5
                  }}
                >
                  {/* IMAGEM */}
                  <Avatar
                    src={prod.img}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />

                  {/* INFO */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight="bold" fontSize={14}>
                      {prod.nome}
                    </Typography>

                    {prod.descricao && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 12 }}
                      >
                        {prod.descricao}
                      </Typography>
                    )}

                    <Typography fontWeight="bold" fontSize={13}>
                      R$ {Number(prod.valor).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* STATUS + MENU */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Switch
                      size="small"
                      checked={Boolean(prod.status)}
                      onChange={() => toggleStatus(prod)}
                    />

                    <ProductMenu
                      onEdit={() => navigate(`/editproduto/${prod.id}`)}
                      onDelete={() => abrirConfirmacaoExcluir(prod)}
                    />
                  </Box>
                </Box>
              </Card>

            ))}
          </Box>
        </Box>
      )}

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
