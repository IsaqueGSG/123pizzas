import { useEffect } from "react";
import {
  escutarPedidos,
  imprimir,
  marcarComoImpresso,
  gerarComandaHTML,
  geraComandaHTML80mm
} from "../../services/impressora.service";

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
