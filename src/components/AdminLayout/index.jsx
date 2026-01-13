import { useEffect } from "react";
import {
  escutarPedidos,
  gerarComandaHTML,
  imprimir,
  marcarComoImpresso
} from "../../services/impressora.service";

import { geraComandaHTML80mm } from "../../components/LayoutComanda"

export default function AdminLayout({ children }) {

  useEffect(() => {
    const unsub = escutarPedidos(async (pedido) => {
      console.log("🖨️ Imprimindo pedido:", pedido.id);

      // const html = gerarComandaHTML(pedido);
      const html = geraComandaHTML80mm(pedido);
      imprimir(html);

      await marcarComoImpresso(pedido.id);
    });

    return () => unsub();
  }, []);

  return <>{children}</>;
}
