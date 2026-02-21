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

  const diaAtual = dias[dataAtual.getDay()];
  const config = horarios[diaAtual];

  if (!config || !config.ativo) return false;

  if (!config.inicio || !config.fim) return false; // proteção extra

  const [hA, mA] = config.inicio.split(":").map(Number);
  const [hF, mF] = config.fim.split(":").map(Number);

  const minutosAgora = dataAtual.getHours() * 60 + dataAtual.getMinutes();
  const minutosAbertura = hA * 60 + mA;
  const minutosFechamento = hF * 60 + mF;

  // horário normal
  if (minutosFechamento > minutosAbertura) {
    return minutosAgora >= minutosAbertura && minutosAgora <= minutosFechamento;
  }

  // atravessa meia-noite
  return (
    minutosAgora >= minutosAbertura ||
    minutosAgora <= minutosFechamento
  );
}
