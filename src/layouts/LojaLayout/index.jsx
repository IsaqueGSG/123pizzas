import { Outlet } from "react-router-dom";

import { Toolbar } from "@mui/material";

import { LojaProvider } from "../../contexts/LojaContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { PreferenciasProvider } from "../../contexts/PreferenciasContext";
import { CartProvider } from "../../contexts/CarrinhoContext";
import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";
import { WhatsProvider } from "../../contexts/Whatsapp.Context";
import { PedidosRealtimeProvider } from "../../contexts/PedidosRealtimeContext";

import Navbar from "../../components/Navbar";
import BellPedidos from "../../components/BellPedidos"

export default function LojaLayout() {
  return (
    <LojaProvider>
      <AuthProvider>
        <PreferenciasProvider>
          <CartProvider>
            <EntregaProvider>
              <ProdutosProvider>
                <WhatsProvider>

                  <PedidosRealtimeProvider> {/* PedidosRealtimeProvider valida se a rota é privada e esculta se for */}

                    <Navbar />
                    <Toolbar />

                    <BellPedidos />{/* BellPedidos valida se a rota é privada e rederiza se for */}

                    <Outlet />

                  </PedidosRealtimeProvider>

                </WhatsProvider>
              </ProdutosProvider>
            </EntregaProvider>
          </CartProvider>
        </PreferenciasProvider>
      </AuthProvider>
    </LojaProvider>
  );
}
