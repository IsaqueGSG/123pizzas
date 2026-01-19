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

export async function criarPedido({ cliente, itens, total }) {
  return addDoc(
    collection(db, "clientes123pedidos", "chavao", "pedidos"),
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

export async function updatePedidoStatus(pedidoId, status) {
  const ref = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pedidos",
    pedidoId
  );

  await updateDoc(ref, { status });
}

export async function aceitarPedido(pedidoId) {
  const ref = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pedidos",
    pedidoId
  );

  await updateDoc(ref, {
    status: "aceito",
    impresso: false
  });
}

export async function deletarPedido(pedidoId) {
  const ref = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pedidos",
    pedidoId
  );

  await deleteDoc(ref);
}

export function escutarPedidos(callback) {
  const q = query(
    collection(db, "clientes123pedidos", "chavao", "pedidos"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot);
  });
}

export async function marcarComoImpresso(pedidoId) {
  await updateDoc(
    doc(db, "clientes123pedidos", "chavao", "pedidos", pedidoId),
    { impresso: true }
  );
}

