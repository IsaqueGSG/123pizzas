// WhatsApp.service.js

export function enviarMensagem(pedido, texto) {
  const telefone = pedido.cliente?.telefone;

  if (!telefone) {
    console.warn("Pedido sem telefone, WhatsApp não enviado");
    return;
  }

  const numeroLimpo = telefone.replace(/\D/g, "");
  const textoLimpo = encodeURIComponent(texto.trim());

  const url = `https://wa.me/55${numeroLimpo}?text=${textoLimpo}`;

  window.open(url, "_blank");
}
