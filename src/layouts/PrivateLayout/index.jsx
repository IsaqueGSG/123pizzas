// src/layouts/PrivateLayout (ou onde estiver localizado)
import { Outlet } from "react-router-dom";
import { Toolbar } from "@mui/material";
import PrivateNavbar from "../../components/Navbar/PrivateNavbar";
import AdminDrawer from "../../components/AdminDrawer";
import { ProdutosProvider } from "../../contexts/ProdutosContext";
import { WhatsProvider } from "../../contexts/Whatsapp.Context";
import { PedidosRealtimeProvider } from "../../contexts/PedidosRealtimeContext";
import BellPedidos from "./BellPedidos";

export default function PrivateLayout() {
  return (
    <ProdutosProvider>
      <WhatsProvider>
        <PedidosRealtimeProvider>
          <PrivateNavbar />
          <Toolbar />
          <AdminDrawer />
          <BellPedidos />
          <Outlet />
        </PedidosRealtimeProvider>
      </WhatsProvider>
    </ProdutosProvider>
  );
}