import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase";

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

/* ---------- EXCLUIR CATEGORIA ---------- */
export async function deleteCategoria(idLoja, idCategoria) {
  const ref = doc(db, "clientes123pedidos", idLoja, "categorias", idCategoria);
  await deleteDoc(ref);
}
