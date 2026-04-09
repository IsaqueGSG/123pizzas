import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Toolbar,
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import CategoriaForm from "../../components/FormCategoria";

import { useLoja } from "../../contexts/LojaContext";
import { useProducts } from "../../contexts/ProdutosContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function EditCategoria() {
  const navigate = useNavigate();
  const { idLoja } = useLoja();
  const { categorias, updateCategoria } = useProducts();
  const { categoriaId } = useParams(); // pega o id da URL

  const [categoria, setCategoria] = useState()

  // Carregar categoria do context
  useEffect(() => {
    if (!categoriaId || !categorias.length) return;

    const encontrada = categorias.find(c => c.id === categoriaId);

    if (!encontrada) {
      alert("Categoria não encontrada");
      navigate(-1);
      return;
    }

    console.log("Categorias:", encontrada);

    setCategoria(structuredClone(encontrada));
  }, [categoriaId, categorias, navigate]);

  async function handleSave(payload) {
    const ref = doc(
      db,
      "clientes123pedidos",
      idLoja,
      "categorias",
      categoriaId
    );

    const updated = {
      ...payload,
      updatedAt: new Date()
    };

    await setDoc(ref, updated, { merge: true });

    updateCategoria(categoriaId, updated);
  }

  return (
    <Box sx={{ p: 2 }}>

      <AdminDrawer />

      {categoria && (
        <CategoriaForm
          mode="edit"
          categoriaInicial={categoria}
          onSave={handleSave}
        />
      )}

    </Box>
  );
}
