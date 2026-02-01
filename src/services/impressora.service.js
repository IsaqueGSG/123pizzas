
export function geraComandaHTML80mm(pedido) {
  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const endereco = pedido.cliente?.endereco || {};
  const pagamento = pedido.cliente?.formaPagamento || {};

  const itensPorTipo = pedido.itens.reduce((acc, item) => {
    const tipo = item.tipo || "Itens";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(item);
    return acc;
  }, {});

  return `
<style>
  body {
    width: 302px;
    margin: 0;
    padding: 8px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  }

  .center { text-align: center; }
  .bold { font-weight: bold; }

  .divider {
    border-top: 2px dashed #000;
    margin: 10px 0;
  }

  .item { margin-bottom: 10px; }

  .produto {
    font-size: 16px;
    font-weight: bold;
  }

  .sub {
    font-size: 13px;
    margin-left: 6px;
  }

  .total {
    font-size: 20px;
    font-weight: bold;
    text-align: right;
  }
</style>

<div class="center">
  <div class="bold" style="font-size:18px">
    ${pedido.cliente?.nome || ""}
  </div>
  <div style="font-size:14px">
    ${pedido.cliente?.telefone || ""}
  </div>
  <div style="font-size:12px">${data}</div>
</div>

<div class="divider"></div>

<div class="bold" style="font-size:15px">Entrega:</div>
<div>
  ${endereco.rua || ""}, ${endereco.numero || ""}<br/>
  ${endereco.bairro || ""} - ${endereco.cidade || ""}/${endereco.uf || ""}
</div>

${endereco.observacao
      ? `<div class="sub"><b>Obs:</b> ${endereco.observacao}</div>`
      : ""
    }

<div class="divider"></div>

${Object.entries(itensPorTipo).map(([tipo, itens]) => `
  <div class="bold" style="margin-top:10px;font-size:15px">
    ${tipo.toUpperCase()}
  </div>

  ${itens.map(item => {
      const nomeBorda = item.borda?.nome;

      return `
      <div class="item">
        <div class="produto">
          ${item.quantidade}x ${item.nome}
        </div>

        ${nomeBorda
          ? `<div class="sub">Borda: ${nomeBorda}</div>`
          : ""
        }

        ${item?.extras?.length
          ? `<div class="sub">
              Extras: ${item.extras
            .map(e => `${e.nome} (+R$ ${e.valor.toFixed(2)})`)
            .join(", ")}
            </div>`
          : ""
        }

        ${item?.observacao
          ? `<div class="sub"><b>Obs:</b> ${item.observacao}</div>`
          : ""
        }
      </div>
    `;
    }).join("")}
`).join("")}

<div class="divider"></div>

<div class="bold" style="font-size:15px">Pagamento:</div>
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

<div class="center" style="font-size:12px">
  Obrigado pela preferência ❤️
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

export function imprimirElectron(html) {
  if (window.electronAPI?.printHTML) {
    window.electronAPI.printHTML(html);
  } else {
    imprimir(html); // fallback navegador
  }
}



export function geraComandaHTML(pedido, largura = "80mm") {
  const is58 = largura === "58mm";

  const widthPx = is58 ? 220 : 302;
  const fontBase = is58 ? 12 : 14;
  const fontProduto = is58 ? 14 : 16;
  const fontTotal = is58 ? 18 : 20;

  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const endereco = pedido.cliente?.endereco || {};
  const pagamento = pedido.cliente?.formaPagamento || {};
  let subTotalItens = 0

  const itensPorTipo = pedido.itens.reduce((acc, item) => {
    const tipo = item.tipo || "Itens";
    if (!acc[tipo]) acc[tipo] = [];
    subTotalItens += item.valor
    acc[tipo].push(item);
    return acc;
  }, {});

  return `
<style>
  body {
    width: ${widthPx}px;
    margin: 0;
    padding: 6px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: ${fontBase}px;
    line-height: 1.35;
  }

  .center { text-align: center; }
  .bold { font-weight: bold; }

  .divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .item { margin-bottom: 8px; }

  .produto {
    font-size: ${fontProduto}px;
    font-weight: bold;
  }

  .sub {
    font-size: ${fontBase - 1}px;
    margin-left: 6px;
  }

  .total {
    font-size: ${fontTotal}px;
    font-weight: bold;
    text-align: right;
  }

  .subTotal {
    font-size: ${fontBase}px;
    font-weight: bold;
    text-align: right;
  }
</style>

<div class="center">
  <div class="bold" style="font-size:${fontProduto + 2}px">
    ${pedido.cliente?.nome || ""}
  </div>
  <div>${pedido.cliente?.telefone || ""}</div>
  <div style="font-size:${fontBase - 1}px">${data}</div>
</div>

<div class="divider"></div>

<div class="bold">Entrega:</div>
<div>
  ${endereco.rua || ""}, ${endereco.numero || ""}<br/>
  ${endereco.bairro || ""} - ${endereco.cidade || ""}/${endereco.uf || ""}
</div>

${endereco.observacao
      ? `<div class="sub"><b>Obs:</b> ${endereco.observacao}</div>`
      : ""
    }

<div class="divider"></div>

${Object.entries(itensPorTipo).map(([tipo, itens]) => `
  <div class="bold" style="margin-top:6px">
    ${tipo.toUpperCase()}
  </div>

  ${itens.map(item => `
    <div class="item">
      <div class="produto">
        ${item.quantidade}x ${item.nome}
      </div>

      ${item.borda?.nome
        ? `<div class="sub"><b>Borda:</b> ${item.borda.nome}</div>`
        : ""
      }

      ${item.extras?.length
        ? `<div class="sub">
            <b>Extras:</b> ${item.extras
          .map(e => `${e.nome} (+${e.valor.toFixed(2)})`)
          .join(", ")}
          </div>`
        : ""
      }

      ${item.observacao
        ? `<div class="sub"><b>Obs:</b> ${item.observacao}</div>`
        : ""
      }
    </div>
  `).join("")}
`).join("")}

<div class="divider"></div>

<div class="bold">Pagamento:</div>
<div>${pagamento.forma || ""}</div>

${pagamento.forma === "DINHEIRO" && pagamento.obsPagamento
      ? `<div class="sub">Troco para: R$ ${pagamento.obsPagamento}</div>`
      : ""
    }

<div class="divider"></div>

<div class="bold">Valores:</div>
<div> Total dos itens: ${subTotalItens.toFixed(2) || ""}</div>
<div> Taxa de entrega: ${endereco.taxaEntrega.toFixed(2) || ""}</div>

<div class="divider"></div>

<div class="total">
  TOTAL: R$ ${pedido.total.toFixed(2)}
</div>

<div class="divider"></div>

<div class="center" style="font-size:${fontBase - 1}px">
  Obrigado pela preferência ❤️
</div>
`;
}
