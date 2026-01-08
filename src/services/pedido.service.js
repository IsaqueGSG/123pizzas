import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function criarPedido({ cliente, itens, total }) {
  return addDoc(collection(db, "clientes123pedidos", "chavao", "pedidos"), {
    cliente,
    itens,
    total,
    status: "pendente",
    createdAt: serverTimestamp()
  });
}
