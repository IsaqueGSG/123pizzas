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

export async function enviarMensagemElectron(idLoja, pedido, texto) {

  if (!window.electronAPI) {
    return enviarMensagem(pedido, texto);
  }


  const telefone = pedido.cliente?.telefone;

  if (!telefone) {
    console.warn("Pedido sem telefone");
    return;
  }

  const res = awaitwindow.electronAPI.enviarWhats(idLoja, telefone, texto);

  if (!res?.ok) {
    console.error("Erro WhatsApp:", res?.erro);
  }
}
