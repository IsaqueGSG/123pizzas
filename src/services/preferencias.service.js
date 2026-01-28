import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";


export async function getPreferencias(idLoja) {
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


export function abertoAgora(horarios) {
  if (!horarios) return true;

  const agora = new Date();

  const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diaAtual = dias[agora.getDay()];

  const config = horarios[diaAtual];
  if (!config || !config.ativo) return false;

  const [hA, mA] = config.inicio.split(":").map(Number);
  const [hF, mF] = config.fim.split(":").map(Number);

  const abertura = new Date();
  abertura.setHours(hA, mA, 0, 0);

  const fechamento = new Date();
  fechamento.setHours(hF, mF, 0, 0);

  // horário normal
  if (fechamento > abertura) {
    return agora >= abertura && agora <= fechamento;
  }

  // vira a meia-noite
  return agora >= abertura || agora <= fechamento;
}

