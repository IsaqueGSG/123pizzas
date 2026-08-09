import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";


export async function getPreferencias(idLoja) {
  console.log("getPreferencias", idLoja);
  const snap = await getDoc(doc(
    db,
    "clientes123pedidos",
    idLoja,
    "configuracoes",
    "preferencias"
  ));
  return snap.exists() ? snap.data() : null;
}

export async function salvarPreferencias(idLoja, preferencias) {
  await setDoc(doc(
    db,
    "clientes123pedidos",
    idLoja,
    "configuracoes",
    "preferencias"
  ), preferencias, { merge: true });
}


export function abertoAgora(horarios, dataAtual = new Date()) {
  if (!horarios) return false;

  const dias = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado"
  ];

  const diaAtualIndex = dataAtual.getDay();
  const diaAtual = dias[diaAtualIndex];

  const minutosAgora =
    dataAtual.getHours() * 60 + dataAtual.getMinutes();

  // =====================================================
  // FUNÇÃO PARA VERIFICAR UM HORÁRIO
  // =====================================================
  const horarioAberto = (config, minutos) => {
    if (!config?.ativo) {
      return false;
    }

    if (!config.inicio || !config.fim) {
      return false;
    }

    const [hInicio, mInicio] = config.inicio.split(":").map(Number);
    const [hFim, mFim] = config.fim.split(":").map(Number);

    const inicio = hInicio * 60 + mInicio;
    const fim = hFim * 60 + mFim;

    // =================================================
    // 00:00 → 00:00 = DIA INTEIRO
    // =================================================
    if (inicio === 0 && fim === 0) {
      return true;
    }

    // =================================================
    // HORÁRIO NORMAL
    // Ex: 08:00 → 18:00
    // =================================================
    if (fim > inicio) {
      return minutos >= inicio && minutos <= fim;
    }

    // =================================================
    // HORÁRIO QUE ATRAVESSA MEIA-NOITE
    // Ex: 18:00 → 02:00
    //
    // Aqui só verificamos a parte do dia de início.
    // A parte da madrugada será verificada pelo
    // dia anterior.
    // =================================================
    if (fim < inicio) {
      return minutos >= inicio;
    }

    return false;
  };

  // =====================================================
  // 1. VERIFICA O HORÁRIO DO DIA ATUAL
  // =====================================================

  const configAtual = horarios[diaAtual];

  if (horarioAberto(configAtual, minutosAgora)) {
    return true;
  }

  // =====================================================
  // 2. VERIFICA SE ESTAMOS NA MADRUGADA DO DIA ANTERIOR
  // =====================================================

  const diaAnteriorIndex = (diaAtualIndex + 6) % 7;
  const diaAnterior = dias[diaAnteriorIndex];

  const configAnterior = horarios[diaAnterior];

  if (
    configAnterior?.ativo &&
    configAnterior.inicio &&
    configAnterior.fim
  ) {
    const [hInicio, mInicio] =
      configAnterior.inicio.split(":").map(Number);

    const [hFim, mFim] =
      configAnterior.fim.split(":").map(Number);

    const inicioAnterior = hInicio * 60 + mInicio;
    const fimAnterior = hFim * 60 + mFim;

    // O horário atravessa meia-noite
    if (
      fimAnterior < inicioAnterior &&
      minutosAgora <= fimAnterior
    ) {
      return true;
    }
  }

  return false;
}
