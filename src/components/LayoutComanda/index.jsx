export function geraComandaHTML80mm(pedido) {
  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comanda</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      width: 302px; /* 80mm real */
      margin: 0;
      padding: 6px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.3;
    }

    .header {
      text-align: center;
      margin-bottom: 6px;
    }

    .cliente {
      font-weight: bold;
      font-size: 14px;
    }

    .data {
      font-size: 11px;
      color: #555;
    }

    .status {
      margin-top: 4px;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      display: inline-block;
      border-radius: 3px;
      color: #fff;
      background: ${
        pedido.status === "pendente"
          ? "#ff9800"
          : pedido.status === "aceito"
            ? "#4caf50"
            : "#9e9e9e"
      };
    }

    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }

    .item {
      margin-bottom: 4px;
    }

    .item-nome {
      font-weight: bold;
      font-size: 13px;
    }

    .obs {
      font-size: 11px;
      margin-left: 4px;
    }

    .total {
      font-weight: bold;
      font-size: 16px;
      text-align: right;
      margin-top: 6px;
    }

    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 6px;
    }

    @media print {
      body {
        margin: 0;
      }
    }
  </style>
</head>
<body>

  <!-- CABEÇALHO -->
  <div class="header">
    <div class="cliente">${pedido.cliente?.nome || ""}</div>
    <div class="data">${data}</div>
    <div class="status">${pedido.status.toUpperCase()}</div>
  </div>

  <div class="divider"></div>

  <!-- ITENS -->
  ${pedido.itens.map(item => `
    <div class="item">
      <div class="item-nome">
       ${item.quantidade}x ${item.nome} 
      </div>
      <div class="obs">
        Borda: ${item.extras?.borda || "Sem borda"}
      </div>
      ${item.obs ? `<div class="obs">Obs: ${item.obs}</div>` : ""}
    </div>
  `).join("")}

  <div class="divider"></div>

  <!-- TOTAL -->
  <div class="total">
    TOTAL: R$ ${pedido.total.toFixed(2)}
  </div>

  <div class="divider"></div>

  <div class="footer">
    Obrigado pela preferência
  </div>

</body>
</html>
`;
}
