import {
  Card,
  CardMedia,
  CardContent,
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
  const { itens, addItem, incrementar, decrementar } = useCarrinho();

  const isPizza = ["pizza", "broto"].includes(produto.tipo);
  const isProdutoSimples = ["bebida", "esfiha"].includes(produto.tipo);

  const valorExibido = produto.valor;
  const carrinhoId = `${produto.tipo}-${produto.id}`;

  const itemCarrinho = itens.find((i) => i.id === carrinhoId);

  const adicionarProdutoSimples = () => {
    addItem({
      id: `${produto.tipo}-${produto.id}`,
      nome: `(${produto.tipo}) ${produto.nome}`,
      valor: produto.valor,
      img: produto.img,
      tipo: produto.tipo,
      descricao: produto.descricao
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
        R$ {valorExibido.toFixed(2)}
      </Typography>
    </CardContent>

    {isPizza ? (
      <Button
        fullWidth
        variant={selecionado ? "outlined" : "contained"}
        onClick={onSelecionar}
      >
        {tipoPizza === "1/2" && produto.tipo === "pizza"
          ? selecionado
            ? "Remover sabor"
            : "Escolher sabor"
          : "Adicionar"}
      </Button>
    ) : !itemCarrinho ? (
      <Button fullWidth variant="contained" onClick={adicionarProdutoSimples}>
        Adicionar
      </Button>
    ) : (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
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
