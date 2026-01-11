export function gerarMensagemWhatsApp(pedido) {
  const texto = `
🍕 *123Pedidos*
Olá ${pedido.cliente.nome}!

Seu pedido foi *ACEITO* 🎉
Total: R$ ${pedido.total.toFixed(2)}

Em breve iniciaremos o preparo.
Obrigado pela preferência!
`;

  return encodeURIComponent(texto);
}
