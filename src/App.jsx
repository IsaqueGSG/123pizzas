import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import { LojaProvider } from "./contexts/LojaContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PreferenciasProvider } from "./contexts/PreferenciasContext";
import { CartProvider } from "./contexts/CarrinhoContext";

import Home from "./pages/Home";
import Cardapio from "./pages/Cardapio";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminProdutos from "./pages/AdminProdutos";
import AdminCategorias from "./pages/AdminCategorias";
import AddProduto from "./pages/AddProduto";
import AddCategoria from "./pages/AddCategoria";
import EditProduto from "./pages/EditProduto";
import EditCategoria from "./pages/EditCategoria";
import AdminPedidos from "./pages/AdminPedidos";
import AdminPreferencias from "./pages/AdminPreferencias";
import WhatsQR from "./pages/WhatsappQR";
import AdminRelatorios from "./pages/AdminRelatorios";
import RegistroSaaS from "./pages/RegistroSaaS";
import ConfirmarCriacao from "./pages/ConfirmarCriacao";


import PrivateRoute from "./components/PrivateRoute";


const App = () => {
  return (
    <BrowserRouter>
      <LojaProvider>
        <PreferenciasProvider>
          <AuthProvider>
            <CartProvider>


              <Routes>

                <Route path="/" element={<Home />} />

                {/* usuario loga na loja selecionada */}
                <Route path="login" element={<Login />} />
                <Route path="/registro-saas" element={<RegistroSaaS />} />
                <Route path="/confirmar-criacao" element={<ConfirmarCriacao />} />

                {/* Navbar */}
                <Route path="/:idLoja" element={<RootLayout />}>

                  {/* contexto Publicos*/}
                  <Route element={<PublicLayout />}>

                    <Route index element={<Cardapio />} />

                    <Route path="checkout" element={<Checkout />} />

                  </Route>

                  {/* contexto Privados*/}
                  <Route path="admin" element={<PrivateLayout />}>
                    <Route
                      path="produtos"
                      element={<PrivateRoute><AdminProdutos /></PrivateRoute>}
                    />
                    <Route
                      path="addproduto"
                      element={<PrivateRoute><AddProduto /></PrivateRoute>}
                    />
                    <Route
                      path="addcategoria"
                      element={<PrivateRoute><AddCategoria /></PrivateRoute>}
                    />
                    <Route
                      path="categorias"
                      element={<PrivateRoute><AdminCategorias /></PrivateRoute>}
                    />
                    <Route
                      path="editproduto/:IDproduto"
                      element={<PrivateRoute><EditProduto /></PrivateRoute>}
                    />
                    <Route
                      path="editcategoria/:categoriaId"
                      element={<PrivateRoute><EditCategoria /></PrivateRoute>}
                    />
                    <Route
                      path="pedidos"
                      element={<PrivateRoute><AdminPedidos /></PrivateRoute>}
                    />
                    <Route
                      path="preferencias"
                      element={<PrivateRoute><AdminPreferencias /></PrivateRoute>}
                    />
                    <Route
                      path="whatsapp"
                      element={<PrivateRoute><WhatsQR /></PrivateRoute>}
                    />
                    <Route
                      path="relatorios"
                      element={<PrivateRoute><AdminRelatorios /></PrivateRoute>}
                    />
                  </Route>

                </Route>

              </Routes>
            </CartProvider>

          </AuthProvider>
        </PreferenciasProvider>
      </LojaProvider >
    </BrowserRouter>
  );
};

export default App;
