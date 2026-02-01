import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../config/firebase";

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);

};

// para usuarios com id = email
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

export const getUserRole = async (idLoja, email) => {
  if (idLoja === "demo") {
    return { allowed: true, role: "admin" };
  }

  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "usuarios",
    email
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { allowed: false, role: null };
  }

  const data = snap.data();

  return {
    allowed: true,
    role: data.role || "viewer"
  };
};
