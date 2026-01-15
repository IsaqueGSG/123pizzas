import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { db } from "../config/firebase";

const produtosRef = collection(
  db,
  "clientes123pedidos",
  "chavao",
  "produtos"
);

export async function getProdutos() {
  const snapshot = await getDocs(produtosRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getProdutosPorTipo(tipo) {
  const q = query(produtosRef, where("tipo", "==", tipo));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addProduto(produto) {
  const docRef = await addDoc(produtosRef, produto);
  return docRef.id;
}

export async function updateProduto(id, novosDados) {
  await updateDoc(doc(produtosRef, id), novosDados);
}

export async function deleteProduto(id) {
  await deleteDoc(doc(produtosRef, id));
}

export async function updateProdutoStatusBatch(produtos) {
  if (!produtos?.length) return;

  const batch = writeBatch(db);

  produtos.forEach((produto) => {
    batch.update(doc(produtosRef, produto.id), {
      status: produto.status
    });
  });

  await batch.commit();
}
