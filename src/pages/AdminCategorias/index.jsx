import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Toolbar,
  Card,
  Switch,
  Button,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductMenu from "../../components/MenuOptions";

import { updateCategoriaStatusBatch, deleteCategoria } from "../../services/categorias.service";
import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AdminCategorias() {
  const { idLoja } = useLoja();
  const navigate = useNavigate();
  const { categorias, loading, updateCategoriasStatus, removeCategoria } = useProducts();

  const [cloneCategorias, setCloneCategorias] = useState([]);
  useEffect(() => {
    setCloneCategorias(categorias.map(c => ({ ...c })));
  }, [categorias]);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const houveMudanca = cloneCategorias.some(cat => {
    const original = categorias.find(c => c.id === cat.id);
    return original && original.status !== cat.status;
  });


  const abrirConfirmacaoExcluir = (cat) => {
    setCategoriaSelecionada(cat);
    setOpenConfirmDialog(true);
  };

  const toggleStatus = (cat) => {
    setCloneCategorias((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, status: !c.status } : c))
    );
  };

  const salvarStatus = async () => {
    const categoriasAlteradas = cloneCategorias.filter(cat => {
      const original = categorias.find(c => c.id === cat.id);
      return original && original.status !== cat.status;
    });

    if (!categoriasAlteradas.length) return;

    try {
      await updateCategoriaStatusBatch(idLoja, categoriasAlteradas);
      updateCategoriasStatus(categoriasAlteradas); // 🔥 Context
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      {loading && <CircularProgress sx={{ mt: 3 }} />}


      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Gestão de Categorias
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate(`/${idLoja}/addcategoria`)}
        >
          Adicionar Nova Categoria
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ---------- LISTA DE CATEGORIAS ---------- */}
      {categorias.length > 0 && (
        <Box sx={{ mb: 4 }}>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {cloneCategorias.map((categoria) => (
              <Card key={categoria.id} sx={{ p: 2 }}>
                <Typography fontWeight="bold">{categoria.nome}</Typography>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Extras:</Typography>
                  {categoria.extras?.length
                    ? categoria.extras.map((e) => (
                      <Typography key={e.id} sx={{ fontSize: 13 }}>
                        {e.nome} - R$ {e.valor.toFixed(2)}
                      </Typography>
                    ))
                    : "Nenhum extra"}
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Bordas:</Typography>
                  {categoria.bordas?.length
                    ? categoria.bordas.map((b) => (
                      <Typography key={b.id} sx={{ fontSize: 13 }}>
                        {b.nome} - R$ {b.valor.toFixed(2)}
                      </Typography>
                    ))
                    : "Nenhuma borda"}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                  <Switch
                    size="small"
                    checked={Boolean(categoria.status)}
                    onChange={() => toggleStatus(categoria)}
                  />

                  <ProductMenu
                    onEdit={() => navigate(`/${idLoja}/editcategoria/${categoria.id}`)}
                    onDelete={() => abrirConfirmacaoExcluir(categoria)}
                  />
                </Box>
              </Card>
            ))}

          </Box>
        </Box>
      )}

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
          p: 2,
          zIndex: 1200,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={salvarStatus}
          disabled={!houveMudanca}
        >
          Salvar status das Categorias
        </Button>
      </Box>

      {/* ---------- CONFIRMAÇÃO ---------- */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${categoriaSelecionada?.nome}"?`}
        funcao={async () => {
          if (!categoriaSelecionada) return;

          await deleteCategoria(idLoja, categoriaSelecionada.id);

          removeCategoria(categoriaSelecionada.id);
          setOpenConfirmDialog(false);
        }}

      />
    </Box>
  );
}
