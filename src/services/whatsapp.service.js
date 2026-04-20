function obterCategoriaItem(item) {

  // 1️⃣ Campo direto (mais confiável)
  if (item.categoriaNome?.trim()) {
    return item.categoriaNome.trim();
  }

  // 2️⃣ Categoria dentro do objeto
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

export function gerarMensagemConfirmacao(pedido) {
  const data = pedido.createdAt?.seconds
    ? new Date(pedido.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const endereco = pedido.cliente?.endereco || {};
  const pagamento = pedido.cliente?.formaPagamento || {};

  let subTotalItens = 0;

  const itensPorCategoria = pedido.itens.reduce((acc, item) => {
    const categoria = obterCategoriaItem(item);

    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(item);

    subTotalItens += item.valor * (item.quantidade ?? 1);

    return acc;
  }, {});

  let mensagem = `✅ *PEDIDO CONFIRMADO!*\n\n`;
  mensagem += `📅 ${data}\n\n`;

  mensagem += `👤 *Cliente:* ${pedido.cliente?.nome || ""}\n`;
  mensagem += `📞 ${pedido.cliente?.telefone || ""}\n\n`;

  mensagem += `📍 *Entrega:*\n`;
  if (pedido.retirarNaLoja) {
    mensagem += `Retirar na loja.\n\n`;
  } else {
    mensagem += `${endereco.rua || ""}, ${endereco.numero || ""}\n`;
    mensagem += `${endereco.bairro || ""} - ${endereco.cidade || ""}/${endereco.uf || ""}\n`;
  }

  if (endereco.observacao) {
    mensagem += `Obs: ${endereco.observacao}\n`;
  }

  pedido.itens.forEach(item => {
    mensagem += `🍽️ *${item.categoriaNome.toUpperCase()}*\n`;

    mensagem += `• ${item.quantidade}x ${item.nome}\n`;

    if (item.selecoes) {
      Object.values(item.selecoes).forEach(grupo => {
        const selecionados = grupo.itens.filter(i => i.status);

        if (selecionados.length) {
          mensagem += `   ${grupo.nome}:\n`;

          selecionados.forEach(i => {
            mensagem += `    ↳ ${i.nome.trim()}${i.valor ? ` (+${i.valor.toFixed(2)})` : ""}\n`;
          });
        }
      });
    }

    if (item.observacao) {
      mensagem += `   Obs: ${item.observacao}\n`;
    }

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

  mensagem += `Avisaremos quando o pedido estiver a caminho! 🚀`;

  return mensagem;
}

export async function enviarMensagemWhatsApp(idLoja, telefone, texto) {
  if (!telefone) {
    console.warn("Telefone não informado. WhatsApp não enviado.");
    alert("Telefone não informado. WhatsApp não enviado.");
    return { ok: false, erro: "Telefone ausente" };
  }

  if (!texto || !texto.trim()) {
    console.warn("Texto vazio. WhatsApp não enviado.");
    alert("Texto vazio. WhatsApp não enviado.");
    return { ok: false, erro: "Texto vazio" };
  }

  const numeroLimpo = telefone.replace(/\D/g, "");

  try {
    // ✅ Se estiver rodando no Electron → envio automático
    if (window.electronAPI?.enviarWhats) {
      const res = await window.electronAPI.enviarWhats(
        idLoja,
        numeroLimpo,
        texto.trim()
      );

      if (!res?.ok) {
        console.error("Erro WhatsApp:", res?.erro);
      }

      return res;
    }

    // 🌐 Fallback navegador → abre WhatsApp Web
    const textoCodificado = encodeURIComponent(texto.trim());
    const url = `https://wa.me/55${numeroLimpo}?text=${textoCodificado}`;

    window.open(url, "_blank", "noreferrer");

    return { ok: true, modo: "manual" };

  } catch (erro) {
    console.error("Erro ao enviar WhatsApp:", erro);
    return { ok: false, erro };
  }
}

export function abrirConversaWhatsApp(telefone) {
  if (!telefone) {
    alert("Telefone não informado");
    return;
  }

  const numeroLimpo = telefone.replace(/\D/g, "");

  const numeroComDDI = numeroLimpo.startsWith("55")
    ? numeroLimpo
    : `55${numeroLimpo}`;

  const url = `https://wa.me/${numeroComDDI}`;

  // 🖥️ Se estiver no Electron
  if (window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url);
  } else {
    // 🌐 Navegador
    window.open(url, "_blank", "noreferrer");
  }
}