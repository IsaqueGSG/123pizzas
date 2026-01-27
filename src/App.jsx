import { BrowserRouter, Routes, Route } from "react-router-dom";

import LojaLayout from "./layouts/LojaLayout";

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

import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/:idLoja" element={<LojaLayout />}>
          <Route index element={<Cardapio />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />

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
        </Route>

        <Route
          path="/"
          element={<div>Por favor, acesse uma loja válida.</div>}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
