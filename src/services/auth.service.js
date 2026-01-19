import { collection, getDocs } from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../config/firebase";

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

// 🔐 verifica se email existe em QUALQUER doc
export const isUserAllowed = async (idLoja, email) => {
  const ref = collection(
    db,
    "clientes123pedidos",
    idLoja,
    "usuarios"
  );

  const snap = await getDocs(ref);

  return snap.docs.some(doc => doc.data().email === email);
};
