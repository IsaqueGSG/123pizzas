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


export async function getProdutos(idLoja) {
  const snapshot = await getDocs(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getProdutosPorTipo(idLoja, tipo) {
  const q = query(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), where("tipo", "==", tipo));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addProduto(idLoja, produto) {
  console.log("Adicionando produto:", produto);
  const docRef = await addDoc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), produto);
  return docRef.id;
}

export async function updateProduto(idLoja, idProduto, novosDados) {
  await updateDoc(doc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), idProduto), novosDados);
}

export async function deleteProduto(idLoja, idProduto) {
  await deleteDoc(doc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), idProduto));
}

export async function updateProdutoStatusBatch(idLoja, produtos) {
  if (!produtos?.length) return;

  const batch = writeBatch(db);

  produtos.forEach((produto) => {
    batch.update(doc(collection(
      db,
      "clientes123pedidos",
      idLoja,
      "produtos"
    ), produto.id), {
      status: produto.status
    });
  });

  await batch.commit();
}
