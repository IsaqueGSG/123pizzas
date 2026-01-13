import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  doc,
  orderBy,
  updateDoc,
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

export async function updatePedidoStatus(id, status) {
  const ref = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pedidos",
    id
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

export function escutarPedidos(callback) {
  const q = query(
    collection(db, "clientes123pedidos", "chavao", "pedidos"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(pedidos);
  });
}
