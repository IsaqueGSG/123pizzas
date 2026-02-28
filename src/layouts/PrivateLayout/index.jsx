import { Outlet } from "react-router-dom";

import { ProdutosProvider } from "../../contexts/ProdutosContext";
import { WhatsProvider } from "../../contexts/Whatsapp.Context";
import { PedidosRealtimeProvider } from "../../contexts/PedidosRealtimeContext";

import AdminDrawer from "../../components/AdminDrawer";
import BellPedidos from "../../components/BellPedidos"

export default function PrivateLayout() {
  return (
    <ProdutosProvider>
      <WhatsProvider>

        <PedidosRealtimeProvider> {/* PedidosRealtimeProvider valida se a rota é privada e esculta se for */}

          <AdminDrawer />

          <BellPedidos />{/* BellPedidos valida se a rota é privada e rederiza se for */}

          <Outlet />

        </PedidosRealtimeProvider>

      </WhatsProvider>
    </ProdutosProvider>
  );
}
