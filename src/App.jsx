import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cardapio from "./pages/Cardapio";
import Checkout from "./pages/Checkout";
import Categorias from "./pages/Categoria";
import AdminProdutos from "./pages/produtos";
import AddProduto from "./pages/AddProduto";
import EditProduto from "./pages/EditProduto";
import Login from "./pages/Login";

import { CartProvider } from "./contexts/CarrinhoContext";
import { ProdutosProvider } from "./contexts/ProdutosContext";
import { AuthProvider } from "./contexts/AuthContext";

import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ProdutosProvider>
          <BrowserRouter>
            <Routes>
              {/* rotas públicas */}
              <Route path="/" element={<Categorias />} />
              <Route path="/cardapio/:categoria" element={<Cardapio />} />
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
            </Routes>
          </BrowserRouter>
        </ProdutosProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
