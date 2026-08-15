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
  where,
  limit,
  getDocs,
  writeBatch
} from "firebase/firestore";

import { db } from "../config/firebase";

import { imprimir, geraComandaHTML } from "./impressora.service";
import {
  enviarMensagemWhatsApp,
  gerarMensagemConfirmacao
} from "./whatsapp.service";

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

export async function deletarPedidos(idLoja, pedidosIds) {
  const TAMANHO_BATCH = 500;

  for (let i = 0; i < pedidosIds.length; i += TAMANHO_BATCH) {
    const lote = pedidosIds.slice(i, i + TAMANHO_BATCH);
    const batch = writeBatch(db);

    lote.forEach((pedidoId) => {
      const ref = doc(
        db,
        "clientes123pedidos",
        idLoja,
        "pedidos",
        pedidoId
      );

      batch.delete(ref);
    });

    await batch.commit();
  }
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

  await atualizarPedido(idLoja, pedido.id, { status: "preparando" });

  const texto = gerarMensagemConfirmacao(pedido);

  await enviarMensagemWhatsApp(
    idLoja,
    pedido.cliente.telefone,
    texto
  );

  const largura = preferencias?.impressao?.largura || "80mm";

  if (!window.electronAPI) {
    const html = geraComandaHTML(pedido, largura);
    imprimir(html);
  } else {
    try {
      await window.electronAPI.imprimirPedido(pedido, largura);
    } catch (error) {
      alert("Erro ao imprimir no Electron:", error);
      const html = geraComandaHTML(pedido, largura);
      imprimir(html);
    }
  }

  await atualizarPedido(idLoja, pedido.id, {
    impresso: true
  });
}

export async function buscarUltimoEnderecoPorTelefone(idLoja, telefone) {
  console.log("buscarUltimoEnderecoPorTelefone", idLoja);

  const pedidosRef = collection(db, "clientes123pedidos", idLoja, "pedidos");

  // Criamos uma query buscando pelo telefone do cliente, ordenando pelo mais recente
  const q = query(
    pedidosRef,
    where("cliente.telefone", "==", telefone),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  // Retorna apenas o endereço do primeiro (mais recente) documento encontrado
  return querySnapshot.docs[0].data().cliente.endereco;
}
