import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

// formato da pizza no firestore e componentes
// {
//   id: 0,
//   nome: "Calabresa",
//   valor: 38,
//   img: "https://images8.alphacoders.com/369/369063.jpg",
//   tipo: "pizza",
//   ingredientes: "calabres e cebola"
// }

export async function getPizzas() {
  const snapshot = await getDocs(collection(db, "clientes123pedidos", "chavao", "pizzas"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
