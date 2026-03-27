import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const getLojas = async () => {
    const snapshot = await getDocs(collection(db, "lojas123pedidos"));

    return snapshot.docs.map(doc => ({
        idLoja: doc.id,
        ...doc.data()
    }));
};

export const criarLoja = async (idLoja, dados) => {
    await setDoc(doc(db, "lojas123pedidos", idLoja), {
        ...dados,
        criadoEm: new Date()
    });
};

export const salvarLoja = async (idLoja, dados) => {
  await setDoc(
    doc(db, "lojas123pedidos", idLoja),
    dados,
    { merge: true }
  );
};