import { Outlet } from "react-router-dom";

import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";

export default function PublicLayout() {
  return (
      <EntregaProvider>
        <ProdutosProvider>

          <Outlet />

        </ProdutosProvider>
      </EntregaProvider>
  );
}
