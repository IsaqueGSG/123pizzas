import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getCategorias(idLoja) {
  const snap = await getDocs(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "categorias"
  ));

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
