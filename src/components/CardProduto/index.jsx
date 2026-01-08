import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useCarrinho } from "../../contexts/CarrinhoContext";

export default function CardProduto({
  produto,
  tipoPizza,
  selecionado,
  onSelecionar
}) {
  const {
    itens,
    addItem,
    incrementar,
    decrementar
  } = useCarrinho();

  const isPizza = produto.tipo === "pizza";

  // 👉 BEBIDA NO CARRINHO
  const itemCarrinho = itens.find(
    (i) => i.id === produto.id
  );

  const adicionarBebida = () => {
    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.valor,
      quantidade: 1,
      img: produto.img
    });
  };

  return (
    <Card
      sx={{
        border: selecionado ? "2px solid" : "1px solid",
        borderColor: selecionado ? "primary.main" : "divider"
      }}
    >
      <CardMedia component="img" height="160" image={produto.img} />

      <CardContent>
        <Typography fontWeight="bold">{produto.nome}</Typography>
        <Typography color="primary">
          R$ {produto.valor.toFixed(2)}
        </Typography>
      </CardContent>

      {/* ---------- AÇÕES ---------- */}
      {isPizza ? (
        <Button
          fullWidth
          variant={selecionado ? "outlined" : "contained"}
          onClick={onSelecionar}
        >
          {tipoPizza === "1/2"
            ? selecionado
              ? "Remover sabor"
              : "Escolher sabor"
            : "Adicionar"}
        </Button>
      ) : !itemCarrinho ? (
        <Button
          fullWidth
          variant="contained"
          onClick={adicionarBebida}
        >
          Adicionar
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            pb: 1
          }}
        >
          <IconButton onClick={() => decrementar(produto.id)}>
            <RemoveIcon />
          </IconButton>

          <Typography fontWeight="bold">
            {itemCarrinho.quantidade}
          </Typography>

          <IconButton onClick={() => incrementar(produto.id)}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
    </Card>
  );
}
