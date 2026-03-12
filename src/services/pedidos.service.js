import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  doc,
  orderBy,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

import { imprimir, geraComandaHTML } from "./impressora.service";
import { enviarMensagemElectron } from "./whatsapp.service";

export async function criarPedido(idLoja, { cliente, itens, total, retirarNaLoja }) {
  return addDoc(
    collection(db, "clientes123pedidos", idLoja, "pedidos"),
    {
      cliente,
      itens,
      total,
      retirarNaLoja,
      status: "pendente",
      impresso: false,
      createdAt: serverTimestamp()
    }
  );
}

export async function deletarPedido(idLoja, pedidoId) {
  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "pedidos",
    pedidoId
  );

  await deleteDoc(ref);
}

export function escutarPedidos(idLoja, callback) {
  const q = query(
    collection(db, "clientes123pedidos", idLoja, "pedidos"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot);
  });
}


export async function atualizarPedido(idLoja, pedidoId, dados) {
  const ref = doc(
    db,
    "clientes123pedidos",
    idLoja,
    "pedidos",
    pedidoId
  );

  await updateDoc(ref, dados);
}

export async function processarPedido({
  idLoja,
  pedido,
  preferencias
}) {

  await atualizarPedido(idLoja, pedido.id, {
    status: "preparando"
  });

  enviarMensagemElectron(idLoja, pedido);

  const largura = preferencias?.impressao?.largura || "80mm";

  if (!window.electronAPI) {
    const html = geraComandaHTML(pedido, largura);
    imprimir(html);
  } else {
    await window.electronAPI.imprimirPedido(pedido, largura);
  }

  await atualizarPedido(idLoja, pedido.id, {
    impresso: true
  });
}

