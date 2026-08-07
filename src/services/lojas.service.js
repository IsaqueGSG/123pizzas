import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

// ⭐ Buscar UMA loja
export const getLoja = async (idLoja) => {
    console.log("getLoja", idLoja);

    if (!idLoja) return null;

    const snap = await getDoc(doc(db, "clientes123pedidos", idLoja));

    if (!snap.exists()) return null;

    return {
        idLoja: snap.id,
        ...snap.data()
    };
};

// (Opcional) listar todas — só para admin global
export const getLojas = async () => {
    const snapshot = await getDocs(collection(db, "clientes123pedidos"));

    return snapshot.docs.map(doc => ({
        idLoja: doc.id,
        ...doc.data()
    }));
};

export const criarLoja = async (idLoja, dados) => {
    await setDoc(doc(db, "clientes123pedidos", idLoja), {
        ...dados,
        criadoEm: new Date()
    });
};

export const salvarLoja = async (idLoja, dados) => {
    await setDoc(
        doc(db, "clientes123pedidos", idLoja),
        dados,
        { merge: true }
    );
};
