import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
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

''
export async function addPizza(pizza) {
  const pizzasRef = collection(db, "clientes123pedidos", "chavao", "pizzas");

  const docRef = await addDoc(pizzasRef, pizza);

  return docRef.id; // retorna o id criado
}


export async function updatePizza(id, novosDados) {
  const pizzaRef = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pizzas",
    id
  );

  await updateDoc(pizzaRef, novosDados);
}

export async function deletePizza(id) {
  const pizzaRef = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "pizzas",
    id
  );

  await deleteDoc(pizzaRef);
}


