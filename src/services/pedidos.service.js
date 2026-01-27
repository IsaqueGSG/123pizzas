import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  doc,
  orderBy,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function criarPedido(idLoja, { cliente, itens, total }) {
  return addDoc(
    collection(db, "clientes123pedidos", idLoja, "pedidos"),
    {
      cliente,
      itens,
      total,
      status: "pendente",
      impresso: false,
      createdAt: serverTimestamp()
    }
  );
}

export async function updatePedidoStatus(idLoja, pedidoId, status) {
  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "pedidos",
    pedidoId
  );

  await updateDoc(ref, { status });
}

export async function deletarPedido(idLoja, pedidoId) {
  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "pedidos",
    pedidoId
  );

  await deleteDoc(ref);
}

export function escutarPedidos(idLoja, callback) {
  const q = query(
    collection(db, "clientes123pedidos", idLoja, "pedidos"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot);
  });
}

export async function marcarComoImpresso(idLoja, pedidoId) {
  await updateDoc(
    doc(db, "clientes123pedidos", idLoja, "pedidos", pedidoId),
    { impresso: true }
  );
}

