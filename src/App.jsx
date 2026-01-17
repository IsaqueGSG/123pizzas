import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'leaflet/dist/leaflet.css';

import Cardapio from "./pages/Cardapio";
import Checkout from "./pages/Checkout";
import AdminProdutos from "./pages/AdminProdutos";
import AddProduto from "./pages/AddProduto";
import EditProduto from "./pages/EditProduto";
import Login from "./pages/Login";
import AdminPedidos from "./pages/AdminPedidos";
import AdminPreferencias from "./pages/AdminPreferencias";

import { CartProvider } from "./contexts/CarrinhoContext";
import { ProdutosProvider } from "./contexts/ProdutosContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PreferenciasProvider } from "./contexts/PreferenciasContext";
import { EntregaProvider } from "./contexts/EntregaContext";

import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <AuthProvider>
      <PreferenciasProvider>
        <CartProvider>
          <EntregaProvider>
            <ProdutosProvider>
              <BrowserRouter>
                <Routes>
                  {/* rotas públicas */}
                  <Route path="/" element={<Cardapio />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />

                  {/* rotas privadas */}
                  <Route
                    path="/produtos"
                    element={
                      <PrivateRoute>
                        <AdminProdutos />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/addproduto"
                    element={
                      <PrivateRoute>
                        <AddProduto />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/editproduto/:IDproduto"
                    element={
                      <PrivateRoute>
                        <EditProduto />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/pedidos"
                    element={
                      <PrivateRoute>
                        <AdminPedidos />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/preferencias"
                    element={
                      <PrivateRoute>
                        <AdminPreferencias />
                      </PrivateRoute>
                    }
                  />

                </Routes>
              </BrowserRouter>
            </ProdutosProvider>
          </EntregaProvider>
        </CartProvider>
      </PreferenciasProvider>
    </AuthProvider >
  );
};

export default App;
