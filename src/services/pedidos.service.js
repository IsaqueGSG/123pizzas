import { collection, addDoc, serverTimestamp, query, getDocs, doc, orderBy, updateDoc } from "firebase/firestore";
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

export async function getPedidos() {
  const q = query(collection(db, "clientes123pedidos", "chavao", "pedidos"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
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


export async function aceitarPedido(id) {
  const ref = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pedidos",
    id
  );

  await updateDoc(ref, {
    status: "aceito",
    impresso: false
  });
}


