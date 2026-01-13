import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";

/**
 * Escuta pedidos aceitos e não impressos
 */
export function escutarPedidos(callback) {
  const q = query(
    collection(db, "clientes123pedidos", "chavao", "pedidos"),
    where("status", "==", "aceito"),
    where("impresso", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const pedido = change.doc.data();
        callback({ id: change.doc.id, ...pedido });
      }
    });
  });
}

/**
 * HTML simples para impressora térmica (58mm)
 */
export function gerarComandaHTML(pedido) {
  return `
    <div style="font-family: monospace; width: 280px;">
      <h3 style="text-align:center;">🍕 123Pedidos</h3>
      <hr/>

      Cliente: ${pedido.cliente.nome}<br/>
      <hr/>

      ${pedido.itens
        .map(
          (item) => `
          ${item.quantidade}x ${item.nome}<br/>
          ${item.extras?.borda ? `Borda: ${item.extras.borda}<br/>` : ""}
          ${item.extras?.obs ? `Obs: ${item.extras.obs}<br/>` : ""}
          <br/>
        `
        )
        .join("")}

      <hr/>
      Total: R$ ${pedido.total.toFixed(2)}
      <br/><br/>
    </div>
  `;
}

/**
 * Marca pedido como impresso
 */
export async function marcarComoImpresso(pedidoId) {
  await updateDoc(
    doc(db, "clientes123pedidos", "chavao", "pedidos", pedidoId),
    { impresso: true }
  );
}

export function imprimir(html) {
  const win = window.open("", "_blank");

  // 🚫 Popup bloqueado
  if (!win) {
    alert(
      "⚠️ O popup de impressão foi bloqueado.\n\n" +
      "Por favor, permita popups para este site e tente novamente."
    );
    return;
  }

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>Impressão</title>
      </head>
      <body onload="window.print(); window.close();">
        ${html}
      </body>
    </html>
  `);
  win.document.close();
}
