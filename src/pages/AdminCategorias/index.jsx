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
  const { categorias, loading } = useProducts(); // Reutilizamos ProdutosContext, que também tem categorias

  const [categoriasOriginais, setCategoriasOriginais] = useState([]);
  const [cloneCategorias, setCloneCategorias] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  /* ---------- EXCLUIR ---------- */
  const abrirConfirmacaoExcluir = (cat) => {
    setCategoriaSelecionada(cat);
    setOpenConfirmDialog(true);
  };

  /* ---------- STATUS ---------- */
  const toggleStatus = (cat) => {
    setCloneCategorias((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, status: !c.status } : c))
    );
  };

  const salvarStatus = async () => {
    const categoriasAlteradas = cloneCategorias.filter((cat) => {
      const original = categoriasOriginais.find((c) => c.id === cat.id);
      return original && original.status !== cat.status;
    });

    if (!categoriasAlteradas.length) return;

    try {
      await updateCategoriaStatusBatch(idLoja, categoriasAlteradas);
      setCategoriasOriginais(cloneCategorias.map((c) => ({ ...c })));
      console.log("Status atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  };

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!categorias.length || cloneCategorias.length) return;
    setCategoriasOriginais(categorias.map((c) => ({ ...c })));
    setCloneCategorias(categorias.map((c) => ({ ...c })));
  }, [categorias]);

  return (
    <Box sx={{ p: 2 }}>
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

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        fullWidth
        onClick={salvarStatus}
        disabled={JSON.stringify(categoriasOriginais) === JSON.stringify(cloneCategorias)}
      >
        Salvar status das Categorias
      </Button>

      {/* ---------- CONFIRMAÇÃO ---------- */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${categoriaSelecionada?.nome}"?`}
        funcao={async () => {
          if (!categoriaSelecionada) return;

          await deleteCategoria(idLoja, categoriaSelecionada.id);

          setCloneCategorias((prev) => prev.filter((c) => c.id !== categoriaSelecionada.id));
          setCategoriasOriginais((prev) => prev.filter((c) => c.id !== categoriaSelecionada.id));
          setOpenConfirmDialog(false);
        }}
      />
    </Box>
  );
}
