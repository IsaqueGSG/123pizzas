// WhatsApp.service.js

export function gerarMensagemConfirmacao(pedido) {
  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const endereco = pedido.cliente?.endereco || {};
  const pagamento = pedido.cliente?.formaPagamento || {};

  let subTotalItens = 0;

  const itensPorTipo = pedido.itens.reduce((acc, item) => {
    const tipo = item.tipo || "Itens";
    if (!acc[tipo]) acc[tipo] = [];
    subTotalItens += item.valor * (item.quantidade ?? 1);
    acc[tipo].push(item);
    return acc;
  }, {});

  let mensagem = `✅ *PEDIDO CONFIRMADO!*\n\n`;
  mensagem += `📅 ${data}\n\n`;

  mensagem += `👤 *Cliente:* ${pedido.cliente?.nome || ""}\n`;
  mensagem += `📞 ${pedido.cliente?.telefone || ""}\n\n`;

  mensagem += `📍 *Entrega:*\n`;
  mensagem += `${endereco.rua || ""}, ${endereco.numero || ""}\n`;
  mensagem += `${endereco.bairro || ""} - ${endereco.cidade || ""}/${endereco.uf || ""}\n`;

  if (endereco.observacao) {
    mensagem += `Obs: ${endereco.observacao}\n`;
  }

  Object.entries(itensPorTipo).forEach(([tipo, itens]) => {
    mensagem += `*${tipo.toUpperCase()}*\n`;

    itens.forEach(item => {
      mensagem += `• ${item.quantidade}x ${item.nome}\n`;

      if (item.borda?.nome) {
        mensagem += `   ↳ Borda: ${item.borda.nome}\n`;
      }

      if (item.extras?.length) {
        mensagem += `   Extras: ${item.extras
          .map(e => `↳ ${e.nome} (+${e.valor.toFixed(2)})`)}\n`;
      }

      if (item.observacao) {
        mensagem += `   ↳ Obs: ${item.observacao}\n`;
      }
    });

    mensagem += `\n`;
  });

  mensagem += `💳 *Pagamento:* ${pagamento.forma || ""}\n`;

  if (pagamento.forma === "DINHEIRO" && pagamento.obsPagamento) {
    const troco = pagamento.obsPagamento - pedido.total;
    mensagem += `💵 Troco para: R$ ${pagamento.obsPagamento}\n`;
    mensagem += `Troco: R$ ${troco.toFixed(2)}\n`;
  }

  mensagem += `\n💰 *Resumo:*\n`;
  mensagem += `Subtotal: R$ ${subTotalItens.toFixed(2)}\n`;
  mensagem += `Taxa de entrega: R$ ${(endereco.taxaEntrega ?? 0).toFixed(2)}\n`;
  mensagem += `\n*TOTAL: R$ ${pedido.total.toFixed(2)}*\n\n`;

  mensagem += `Obrigado pela preferência ❤️`;

  return mensagem;
}


export function enviarMensagemManualmente(pedido, texto) {
  const telefone = pedido.cliente?.telefone;

  if (!telefone) {
    console.alert(`Pedido de ${pedido.cliente.nome}/${pedido.cliente?.endereco.rua} esta sem telefone, WhatsApp não enviado`);
    return;
  }

  const numeroLimpo = telefone.replace(/\D/g, "");
  const textoLimpo = encodeURIComponent(texto.trim());

  const url = `https://wa.me/55${numeroLimpo}?text=${textoLimpo}`;

  window.open(url, "_blank");
}

export async function enviarMensagemElectronAutomatica(idLoja, pedido) {

  const telefone = pedido.cliente?.telefone;

  if (!telefone) {
    console.alert(`Pedido de ${pedido.cliente.nome}/${pedido.cliente?.endereco.rua} esta sem telefone, WhatsApp não enviado`);
    return;
  }

  const texto = gerarMensagemConfirmacao(pedido)

  if (!window.electronAPI) {
    return enviarMensagemManualmente(pedido, texto);
  }

  const res = await window.electronAPI.enviarWhats(idLoja, telefone, texto);

  if (!res?.ok) {
    console.error("Erro WhatsApp:", res?.erro);
  }
}
