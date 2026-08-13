import { Outlet } from "react-router-dom";
import { Toolbar } from "@mui/material";
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import { EntregaProvider } from "../../contexts/EntregaContext";
import { ProdutosProvider } from "../../contexts/ProdutosContext";

export default function PublicLayout() {
  return (
      <EntregaProvider>
        <ProdutosProvider>
          <PublicNavbar />
          <Toolbar />
          <CarrinhoDrawer />
          <Outlet />
        </ProdutosProvider>
      </EntregaProvider>
  );
}