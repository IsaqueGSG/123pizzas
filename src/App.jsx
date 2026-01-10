import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cardapio from "./pages/Cardapio";
import Checkout from "./pages/Checkout";
import Categorias from "./pages/Categoria";
import AtivarProdutos from "./pages/AtivarProdutos";
import AddProduto from "./pages/AddProduto";
import EditProduto from "./pages/EditProduto";
import { CartProvider } from "./contexts/CarrinhoContext";
import { ProdutosProvider } from "./contexts/ProdutosContext";

const App = () => {
  return (
    <CartProvider>
      <ProdutosProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Categorias />} />
            <Route path="/produtos" element={<AtivarProdutos />} />
            <Route path="/cardapio/:categoria" element={<Cardapio />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/addproduto" element={<AddProduto />} />
            <Route path="/editproduto/:IDproduto" element={<EditProduto />} />
          </Routes>
        </BrowserRouter>
      </ProdutosProvider>
    </CartProvider>
  );
};

export default App;
