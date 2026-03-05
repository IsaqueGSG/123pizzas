import {
  collection, getDocs, doc, deleteDoc, writeBatch, addDoc, getDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { duplicarProdutosDaCategoria } from "./produtos.service";

export async function duplicarCategoriaComProdutos(idLoja, categoriaId) {
  try {
    if (!idLoja || !categoriaId) {
      throw new Error("idLoja e categoriaId são obrigatórios");
    }

    const categoriaRef = doc(
      db,
      "clientes123pedidos",
      idLoja,
      "categorias",
      categoriaId
    );

    const categoriaSnap = await getDoc(categoriaRef);

    if (!categoriaSnap.exists()) {
      throw new Error("Categoria não encontrada");
    }

    const categoriaOriginal = categoriaSnap.data();

    const novaCategoria = {
      ...categoriaOriginal,
      nome: `${categoriaOriginal.nome} (Cópia ${new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })})`,
      createdAt: Date.now(),
    };

    // nunca copiar id manual
    delete novaCategoria.id;

    const novaCategoriaRef = await addDoc(
      collection(db, "clientes123pedidos", idLoja, "categorias"),
      novaCategoria
    );

    const novaCategoriaId = novaCategoriaRef.id;

    // duplicar produtos da categoria antiga para a nova
    const produtosCriados = await duplicarProdutosDaCategoria(
      idLoja,
      categoriaId,
      novaCategoriaId
    );

    return {
      novaCategoria: {
        id: novaCategoriaId,
        ...novaCategoria,
      },
      produtosCriados,
    };
  } catch (error) {
    console.error("Erro ao duplicar categoria com produtos:", error);
    throw error;
  }
}

/* ---------- BUSCAR CATEGORIAS ---------- */
export async function getCategorias(idLoja) {
  const snap = await getDocs(collection(db, "clientes123pedidos", idLoja, "categorias"));

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/* ---------- ATUALIZAR STATUS EM LOTE ---------- */
export async function updateCategoriaStatusBatch(idLoja, categorias) {
  const batch = writeBatch(db);

  categorias.forEach(cat => {
    const ref = doc(db, "clientes123pedidos", idLoja, "categorias", cat.id);
    batch.update(ref, { status: cat.status });
  });

  await batch.commit();
}

export async function updateCategoriasPosicaoBatch(idLoja, categorias) {
  const batch = writeBatch(db);

  categorias.forEach(cat => {
    const ref = doc(db, "clientes123pedidos", idLoja, "categorias", cat.id);

    batch.update(ref, {
      posicao: cat.posicao
    });
  });

  await batch.commit();
}

/* ---------- EXCLUIR CATEGORIA ---------- */
export async function deleteCategoria(idLoja, idCategoria) {
  const ref = doc(db, "clientes123pedidos", idLoja, "categorias", idCategoria);
  await deleteDoc(ref);
}

export function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

