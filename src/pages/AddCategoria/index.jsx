import { useState } from "react";
import {
  Snackbar,
  Alert,
  Box,
  Toolbar,
} from "@mui/material";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { db } from "../../config/firebase";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import CategoriaForm from "../../components/FormCategoria";

import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

import { gerarSlug } from "../../services/categorias.service";

export default function AddCategoria() {
  const { addCategoria } = useProducts();
  const { idLoja } = useLoja();
  const [erro, setErro] = useState("");

  async function handleSave(payload) {
    const id = gerarSlug(payload.nome);

    const ref = doc(db, "clientes123pedidos", idLoja, "categorias", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setErro("Categoria já existe");
      throw new Error("Categoria já existe");
    }

    await setDoc(ref, { ...payload, createdAt: new Date() });
    addCategoria({ id, ...payload });
  }

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <Snackbar
        open={!!erro}
        autoHideDuration={3000}
        onClose={() => setErro("")}
      >
        <Alert severity="error" variant="filled">
          {erro}
        </Alert>
      </Snackbar>

      <CategoriaForm mode="add" onSave={handleSave} />


    </Box>
  );
}
