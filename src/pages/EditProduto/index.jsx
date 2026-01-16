import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Toolbar, Typography } from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { useProducts } from "../../contexts/ProdutosContext";

import EditSabor from "../../components/EditSabor";
import EditBebida from "../../components/EditBebida";
import EditExtra from "../../components/EditExtra";
import EditBorda from "../../components/EditBorda";

export default function EditProduto() {
  const { IDproduto } = useParams();
  const navigate = useNavigate();
  const { produtos, loading } = useProducts();

  const [produto, setProduto] = useState(null);

  useEffect(() => {
    if (loading || !produtos.length) return;

    const encontrado = produtos.find(p => p.id === IDproduto);
    if (encontrado) setProduto(encontrado);
  }, [IDproduto, produtos, loading]);

  if (loading || !produto) {
    return (
      <Box sx={{ p: 2 }}>
        <Navbar />
        <Toolbar />
        <Typography>Carregando produto...</Typography>
      </Box>
    );
  }

  const props = {
    produto,
    onCancel: () => navigate("/produtos"),
    onSaved: () => navigate("/produtos")
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      {["pizza", "broto", "esfiha"].includes(produto.tipo) && (
        <EditSabor {...props} />
      )}

      {produto.tipo === "bebida" && <EditBebida {...props} />}
      {produto.tipo === "extra" && <EditExtra {...props} />}
      {produto.tipo === "borda" && <EditBorda {...props} />}
    </Box>
  );
}
