import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Switch,
  Button,
  Divider,
} from "@mui/material";

import AdminDrawer from "../../components/AdminDrawer";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductMenu from "../../components/MenuOptions";
import PosicaoCategorias from "../../components/PosicaoCategorias";

import { updateCategoriaStatusBatch, deleteCategoria, duplicarCategoriaComProdutos } from "../../services/categorias.service";
import { deleteProdutosPorCat } from "../../services/produtos.service";
import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AdminCategorias() {
  const { idLoja } = useLoja();
  const navigate = useNavigate();
  const { addCategoria, addProduto, categorias, loading, updateCategoriasStatus, removeCategoria, removeProdutosPorCategoria } = useProducts();

  const [openOrdenar, setOpenOrdenar] = useState(false);

  const [cloneCategorias, setCloneCategorias] = useState([]);
  useEffect(() => {
    if (!categorias) return;

    console.log(categorias)

    const cloneCat = [...categorias]
      .map(c => ({ ...c }))
      .sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
          sensitivity: "base",
        })
      );

    setCloneCategorias(cloneCat);
  }, [categorias]);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const houveMudanca = categorias?.length && cloneCategorias.some(cat => {
    const categoriasMap = new Map(categorias.map(c => [c.id, c]));
    const original = categoriasMap.get(cat.id);
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

  const [duplicandoId, setDuplicandoId] = useState(null);

  const duplicarCategoria = async (categoria) => {
    if (duplicandoId === categoria.id) return;

    try {
      setDuplicandoId(categoria.id);

      const { novaCategoria, produtosCriados } =
        await duplicarCategoriaComProdutos(idLoja, categoria.id);

      // Atualiza o context (instantâneo na UI)
      addCategoria(novaCategoria);

      produtosCriados.forEach((p) => {
        addProduto(p);
      });

    } catch (error) {
      console.error("Erro ao duplicar categoria:", error);
    } finally {
      setDuplicandoId(null);
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>

      <AdminDrawer />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>

        <Button
          variant="outlined"
          onClick={() => setOpenOrdenar(true)}
        >
          Ordenar Categorias
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate(`/${idLoja}/admin/addcategoria`)}
        >
          +
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {
        loading && (
          <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress />
          </Box>
        )
      }

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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight="bold">{categoria.nome}</Typography>

                  <Switch
                    size="small"
                    checked={Boolean(categoria.status)}
                    onChange={() => toggleStatus(categoria)}
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Extras:</Typography>
                  {categoria.gruposExtras?.length ? (
                    categoria.gruposExtras.map((g) => (
                      <Box key={g.id} sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: "bold" }}>
                          {g.nome} (min: {g.minimo} / max: {g.limite})
                        </Typography>

                        {g.itens.map((item) => (
                          <Typography key={item.id} sx={{ fontSize: 12, ml: 1 }}>
                            • {item.nome} - R$ {item.valor.toFixed(2)}
                          </Typography>
                        ))}
                      </Box>
                    ))
                  ) : (
                    "Nenhum Extra cadastrado"
                  )}
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Horario:</Typography>
                  {categoria.horarioFuncionamento?.inicio && categoria.horarioFuncionamento?.fim ? (
                    <Typography sx={{ fontSize: 13 }}>
                      {categoria.horarioFuncionamento.inicio} - {categoria.horarioFuncionamento.fim}
                    </Typography>
                  ) : (
                    "Horário não definido"
                  )}
                </Box>

                <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
                  <ProductMenu
                    onEdit={() => navigate(`/${idLoja}/admin/editcategoria/${categoria.id}`)}
                    onDelete={() => abrirConfirmacaoExcluir(categoria)}
                    duplicar={() => duplicarCategoria(categoria)}
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
        message={`Tem certeza que deseja excluir "${categoriaSelecionada?.nome}" e todos os seu produtos?`}
        funcao={async () => {
          if (!categoriaSelecionada) return;

          try {
            await deleteProdutosPorCat(idLoja, categoriaSelecionada.id);
            await deleteCategoria(idLoja, categoriaSelecionada.id);

            // só atualiza o context se o backend deu certo
            removeProdutosPorCategoria(categoriaSelecionada.id);
            removeCategoria(categoriaSelecionada.id);

            setOpenConfirmDialog(false);
          } catch (error) {
            console.error("Erro ao excluir categoria:", error);
          }
        }}
      />

      <PosicaoCategorias
        open={openOrdenar}
        onClose={() => setOpenOrdenar(false)}
      />
    </Box>
  );
}
