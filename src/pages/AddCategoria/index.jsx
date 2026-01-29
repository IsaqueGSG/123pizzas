import {
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

  async function handleSave(payload) {
    const id = gerarSlug(payload.nome);

    const ref = doc(db, "clientes123pedidos", idLoja, "categorias", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      alert("Categoria já existe")
      throw new Error("Categoria já existe")
    };

    await setDoc(ref, { ...payload, createdAt: new Date() });
    addCategoria({ id, ...payload });
  }

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Toolbar />
      <AdminDrawer />

      <CategoriaForm mode="add" onSave={handleSave} />
    </Box>
  );
}
