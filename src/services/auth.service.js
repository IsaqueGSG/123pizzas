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

export const isUserAllowed = async (idLoja, email) => {

  if (idLoja === "demo") return true;

  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "usuarios",
    email
  );

  const snap = await getDoc(ref);
  return snap.exists();
};
