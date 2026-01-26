import { Outlet } from "react-router-dom";

import { LojaProvider } from "../../contexts/LojaContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { PreferenciasProvider } from "../../contexts/PreferenciasContext";
import { CartProvider } from "../../contexts/CarrinhoContext";
import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";

export default function LojaLayout() {
  return (
    <LojaProvider>
      <AuthProvider>
        <PreferenciasProvider>
          <CartProvider>
            <EntregaProvider>
              <ProdutosProvider>
                <Outlet />
              </ProdutosProvider>
            </EntregaProvider>
          </CartProvider>
        </PreferenciasProvider>
      </AuthProvider>
    </LojaProvider>
  );
}
