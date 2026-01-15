import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useCarrinho } from "../../contexts/CarrinhoContext";

export default function CardProduto({
  produto,
  tipoPizza,
  selecionado,
  onSelecionar,
  fator,
}) {
  const { itens, addItem, incrementar, decrementar } = useCarrinho();

  const isPizza = produto.tipo === "pizza";

  /* -------- PREÇO -------- */
  const precoExibido = isPizza
    ? produto.valor * fator
    : produto.valor;


  /* -------- ID DO CARRINHO -------- */
  const carrinhoId = `${produto.tipo}-${produto.id}`;

  const itemCarrinho = itens.find(
    (i) => i.id === carrinhoId
  );

  const adicionarBebida = () => {
    addItem({
      id: carrinhoId,
      nome: produto.nome,
      preco: produto.valor,
      quantidade: 1,
      img: produto.img
    });
  };

  return (
    <Card>
      <CardMedia component="img" height="160" image={produto.img} />

      <CardContent>
        <Typography fontWeight="bold">
          {produto.nome}
        </Typography>

        <Typography color="primary" fontWeight="bold">
          R$ {precoExibido.toFixed(2)}
        </Typography>
      </CardContent>

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
        <Button fullWidth variant="contained" onClick={adicionarBebida}>
          Adicionar
        </Button>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton onClick={() => decrementar(carrinhoId)}>
            <RemoveIcon />
          </IconButton>

          <Typography>{itemCarrinho.quantidade}</Typography>

          <IconButton onClick={() => incrementar(carrinhoId)}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
    </Card>
  );
}
