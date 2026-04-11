
function obterCategoriaItem(item) {

  // 1️⃣ Campo direto do seu banco
  if (item.categoriaNome?.trim()) {
    return item.categoriaNome.trim();
  }

  // 2️⃣ Caso venha dentro de categoria
  if (item.categoria?.nome?.trim()) {
    return item.categoria.nome.trim();
  }

  // 3️⃣ Pizza mista → pegar categoria do primeiro sabor
  if (item.sabores?.length) {
    const nome = item.sabores[0]?.categoria?.nome;
    if (nome?.trim()) return nome.trim();
  }

  // 4️⃣ Fallback
  if (item.tipo?.trim()) return item.tipo.trim();

  return "Itens";
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


export function geraComandaHTML(pedido, largura = "80mm", numComanda) {
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

  const itensPorCategoria = pedido.itens.reduce((acc, item) => {
    const categoria = obterCategoriaItem(item);

    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(item);

    subTotalItens += item.valor * (item.quantidade ?? 1);

    return acc;
  }, {});

  return `
<style>
  body {
    width: ${widthPx}px;
    margin: 0;
    padding: 6px;
    padding-bottom: 60px;
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

<div style="width:100%; display:flex; justify-content:space-between; align-items:center">
  <div>
    <div class="bold" style="font-size:${fontProduto + 2}px">
      ${pedido.cliente?.nome || ""}
    </div>
    <div>${pedido.cliente?.telefone || ""}</div>
    <div style="font-size:${fontBase - 1}px">${data}</div>
  </div>

  ${numComanda ? `<div class="bold" style="font-size:30px">#${numComanda}</div>` : ""}
</div>

<div class="divider"></div>

<div><b>Entrega:</b>
${pedido.retirarNaLoja
      ? `Retirar na loja`
      : `
        ${endereco.rua || ""}, ${endereco.numero || ""}<br/>
        ${endereco.bairro || ""}, ${endereco.cidade || ""}
      `
    }
</div>

${endereco.observacao
      ? `<div class="sub"><b>Obs:</b> ${endereco.observacao}</div>`
      : ""
    }

<div class="divider"></div>

${Object.entries(itensPorCategoria).map(([tipo, itens]) => `
  <div class="bold" style="margin-top:6px">
    ${tipo.toUpperCase()}
  </div>

  ${itens.map(item => `
    <div class="item">
      <div class="produto">
        ${item.quantidade}x ${item.nome}
      </div>

      ${item.selecoes && Object.keys(item.selecoes).length > 0
        ? Object.entries(item.selecoes).map(([grupoId, grupo]) => `
          <div class="sub">
            <b>• ${grupo.nome}:</b><br/>
            ${grupo.itens
            .map(e => `-> ${e.nome} (+${e.valor.toFixed(2)})`)
            .join("<br/>")
          }
          </div>
        `).join("")
        : ""
      }

      ${item.observacao
        ? `<div class="sub"><b>OBS:</b> ${item.observacao}</div>`
        : ""
      }
    </div>
  `).join("")}
`).join("")}

<div class="divider"></div>

<div class="bold">Valores:</div>
<div> Total dos itens: ${subTotalItens.toFixed(2) || ""}</div>
<div> Taxa de entrega: ${(endereco.taxaEntrega ?? 0).toFixed(2)}</div>

<div class="divider"></div>

<div class="total">
  ${pedido?.cliente?.formaPagamento?.forma}: R$ ${Number(pedido?.total || 0).toFixed(2)}
</div>

${pedido?.cliente?.formaPagamento?.obsPagamento
      ? `
    <div class="subTotal">
      <b>Recebe:</b> R$ ${Number(pedido.cliente.formaPagamento.obsPagamento).toFixed(2)} e 
      <b>Devolve:</b> R$ ${(
        Number(pedido.cliente.formaPagamento.obsPagamento) - Number(pedido.total || 0)
      ).toFixed(2)}
    </div>
    `
      : ""
    }

`;
}
