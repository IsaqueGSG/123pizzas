import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

// formato de bebida no firestore e componentes
//  {
//   id: 2,
//   nome: "Refrigerante 1L",
//   valor: 8,
//   img: "https://images8.alphacoders.com/369/369063.jpg",
//   tipo: "bebida"
// }

export async function getBebidas() {
  const snapshot = await getDocs(collection(db, "clientes123pedidos", "chavao", "bebidas"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
