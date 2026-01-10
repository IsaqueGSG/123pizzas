import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase";

// formato de bebida no firestore e componentes
// const bebida = {
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

export async function addBebida(bebida) {
  const bebidasRef = collection(db, "clientes123pedidos", "chavao", "bebidas");

  const docRef = await addDoc(bebidasRef, bebida);

  return docRef.id; // retorna o id criado
}


export async function updateBebida(id, novosDados) {
  const bebidaRef = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "bebidas",
    id
  );

  await updateDoc(bebidaRef, novosDados);
}

export async function deleteBebida(id) {
  const bebidaRef = doc(
    db,
    "clientes123pedidos",
    "chavao",
    "bebidas",
    id
  );

  await deleteDoc(bebidaRef);
}


export async function updateBebidaStatusBatch(bebidas) {
  if (!bebidas || bebidas.length === 0) return;

  const batch = writeBatch(db);

  bebidas.forEach((bebida) => {
    const ref = doc(
      db,
      "clientes123pedidos",
      "chavao",
      "bebidas",
      bebida.id
    );

    batch.update(ref, {
      status: bebida.status,
    });
  });

  await batch.commit();
}