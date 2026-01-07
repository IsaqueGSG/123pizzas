import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cardapio from "./pages/Cardapio";
import Checkout from "./pages/Checkout";
import Categorias from "./pages/Categoria";
import { CartProvider } from "./contexts/CarrinhoContext";
import { ProdutosProvider } from "./contexts/ProdutosContext";

const App = () => {
  return (
    <CartProvider>
      <ProdutosProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Categorias />} />
            <Route path="/cardapio/:categoria" element={<Cardapio />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </BrowserRouter>
      </ProdutosProvider>
    </CartProvider>
  );
};

export default App;
