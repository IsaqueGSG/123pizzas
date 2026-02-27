import { Outlet } from "react-router-dom";

import { Toolbar } from "@mui/material";

import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";

import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

export default function PublicLayout() {
  return (
      <EntregaProvider>
        <ProdutosProvider>

          <Navbar />
          <Toolbar />
          <CarrinhoDrawer />
          <Outlet />

        </ProdutosProvider>
      </EntregaProvider>
  );
}
