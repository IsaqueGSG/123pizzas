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


export function abertoAgora(horarioFuncionamento) {
  // fallback seguro (não bloqueia pedidos se não houver config)
  if (!horarioFuncionamento) return true;

  const agora = new Date();
  const dia = agora.getDay(); // 0 = domingo

  const config = horarioFuncionamento[dia];

  if (!config || !config.ativo) return false;

  const [horaA, minA] = config.abertura.split(":").map(Number);
  const [horaF, minF] = config.fechamento.split(":").map(Number);

  const abertura = new Date();
  abertura.setHours(horaA, minA, 0, 0);

  const fechamento = new Date();
  fechamento.setHours(horaF, minF, 0, 0);

  // 🔥 suporta horários normais (ex: 18:00 → 23:00)
  if (fechamento > abertura) {
    return agora >= abertura && agora <= fechamento;
  }

  // 🌙 suporta horário que vira a meia-noite (ex: 18:00 → 02:00)
  return agora >= abertura || agora <= fechamento;
}
