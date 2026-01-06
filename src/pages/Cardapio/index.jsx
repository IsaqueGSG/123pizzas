import { useProducts } from "../../contexts/ProdutosContext";
import Carrinho from "../../components/Carrinho";
import CardPizza from "../../components/CardPizza"

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

const Cardapio = () => {
  const { produtos, loading } = useProducts();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        🍕 Cardápio
      </Typography>

      {/* Carrinho sempre visível */}
      <Carrinho />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Lista de produtos */}
      {!loading &&
        produtos.map((produto) => (
          <CardPizza
            key={produto.id}
            pizza={produto}
          />
        ))}
    </Box>
  );
};

export default Cardapio;
