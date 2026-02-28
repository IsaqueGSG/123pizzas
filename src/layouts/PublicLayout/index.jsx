import { Outlet } from "react-router-dom";

import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";

import CarrinhoDrawer from "../../components/CarrinhoDrawer";

export default function PublicLayout() {
  return (
      <EntregaProvider>
        <ProdutosProvider>

          <CarrinhoDrawer />
          <Outlet />

        </ProdutosProvider>
      </EntregaProvider>
  );
}
