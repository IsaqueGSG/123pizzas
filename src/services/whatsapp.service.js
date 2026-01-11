export function gerarMensagemWhatsApp(pedido) {
  const texto = `
🍕 *123Pedidos*
Olá ${pedido.cliente.nome}!

Seu pedido foi *ACEITO* 🎉
Total: R$ ${pedido.total.toFixed(2)}

Em breve iniciaremos o preparo.
Obrigado pela preferência!
`;

  return encodeURIComponent(texto.trim());
}


export function enviarMensagem(pedido) {
  const telefone = pedido.cliente?.telefone;

  if (!telefone) {
    console.warn("Pedido sem telefone, WhatsApp não enviado");
    return;
  }

  const numeroLimpo = telefone.replace(/\D/g, "");

  const mensagem = gerarMensagemWhatsApp(pedido);

  const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

