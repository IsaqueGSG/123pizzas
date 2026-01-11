import { useEffect } from "react";
import {
  escutarPedidos,
  gerarComandaHTML,
  imprimir,
  marcarComoImpresso
} from "../../services/impressora.service";

export default function AdminLayout({ children }) {

  useEffect(() => {
    const unsub = escutarPedidos(async (pedido) => {
      console.log("🖨️ Imprimindo pedido:", pedido.id);

      const html = gerarComandaHTML(pedido);
      imprimir(html);

      await marcarComoImpresso(pedido.id);
    });

    return () => unsub();
  }, []);

  return <>{children}</>;
}
