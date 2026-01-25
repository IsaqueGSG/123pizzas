
export function geraComandaHTML80mm(pedido) {
  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const endereco = pedido.cliente?.endereco || {};
  const pagamento = pedido.cliente?.formaPagamento || {};

  const itensPorTipo = pedido.itens.reduce((acc, item) => {
    const tipo = item.tipo || "";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(item);
    return acc;
  }, {});

  return `
<style>
  body {
    width: 302px;
    margin: 0;
    padding: 6px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    line-height: 1.3;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .item { margin-bottom: 6px; }
  .sub { font-size: 11px; margin-left: 6px; }
  .total { font-size: 16px; font-weight: bold; text-align: right; }
</style>

<div class="center">
  <div class="bold">${pedido.cliente?.nome || ""}</div>
  <div>${pedido.cliente?.telefone || ""}</div>
  <div style="font-size:11px">${data}</div>
  <div class="bold">${pedido.status.toUpperCase()}</div>
</div>

<div class="divider"></div>

<div class="bold">Entrega:</div>
<div>
  ${endereco.rua || ""}, ${endereco.numero || ""}<br/>
  ${endereco.bairro || ""} - ${endereco.cidade || ""}/${endereco.uf || ""}
</div>

${endereco.observacao ? `<div class="sub">Obs: ${endereco.observacao}</div>` : ""}

<div class="divider"></div>

${Object.entries(itensPorTipo).map(([tipo, itens]) => `
  <div class="bold" style="margin-top:8px">
    ${tipo.toUpperCase()}
  </div>

  ${itens.map(item => {
    const borda =
      typeof item.extras?.borda === "string"
        ? item.extras.borda
        : item.extras?.borda?.nome;

    return `
      <div class="item">
        <div class="bold">${item.quantidade}x ${item.nome}</div>
        ${borda ? `<div class="sub">Borda: ${borda}</div>` : ""}
        ${item.extras?.adicionais?.length
        ? `<div class="sub">
              Extras: ${item.extras.adicionais
          .map(e => `${e.nome} (+R$ ${e.valor.toFixed(2)})`)
          .join(", ")}
            </div>`
        : ""
      }
        ${item.extras?.obs ? `<div class="sub">Obs: ${item.extras.obs}</div>` : ""}
      </div>
    `;
  }).join("")}
`).join("")}

<div class="divider"></div>

<div class="bold">Pagamento:</div>
<div>${pagamento.forma || ""}</div>

${pagamento.forma === "DINHEIRO" && pagamento.obsPagamento
      ? `<div class="sub">Troco para: R$ ${pagamento.obsPagamento}</div>`
      : ""
    }

<div class="divider"></div>

<div class="total">
  TOTAL: R$ ${pedido.total.toFixed(2)}
</div>

<div class="divider"></div>

<div class="center" style="font-size:10px">
  Obrigado pela preferência ❤️
</div>
`;
}



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
