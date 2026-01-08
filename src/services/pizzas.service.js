import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getPizzas() {
  const snapshot = await getDocs(collection(db,  "clientes123pedidos", "chavao", "pizzas"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
