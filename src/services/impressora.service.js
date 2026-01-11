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


export function escutarPedidos(callback) {
    const q = query(
        collection(db, "clientes123pedidos", "chavao", "pedidos"),
        where("status", "==", "aceito"),
        where("impresso", "==", false)
    );

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                const pedido = change.doc.data();

                if (pedido.impresso === false) {
                    callback({ id: change.doc.id, ...pedido });
                }
            }
        });
    });
}

export function gerarComandaHTML(pedido) {
    return `
  <style>
    body {
      font-family: monospace;
      width: 280px;
    }
    h2 {
      text-align: center;
    }
    hr {
      border: 1px dashed #000;
    }
  </style>

  <h2>🍕 123Pedidos</h2>

  <p><strong>Cliente:</strong> ${pedido.cliente.nome}</p>

  <hr />

  ${pedido.itens.map(item => `
    <p>
      ${item.quantidade}x ${item.nome}<br/>
      ${item.extras?.borda ? `Borda: ${item.extras.borda}<br/>` : ""}
      ${item.extras?.obs ? `Obs: ${item.extras.obs}<br/>` : ""}
    </p>
  `).join("")}

  <hr />

  <strong>Total: R$ ${pedido.total.toFixed(2)}</strong>
  `;
}

export function imprimir(html) {
    const janela = window.open("", "PRINT", "height=600,width=400");

    janela.document.write(`
    <html>
      <body onload="window.print(); window.close();">
        ${html}
      </body>
    </html>
  `);
    janela.document.close();
}

export async function marcarComoImpresso(pedidoId) {
    await updateDoc(
        doc(db, "clientes123pedidos", "chavao", "pedidos", pedidoId),
        { impresso: true }
    );
}
