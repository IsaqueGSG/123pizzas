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

export default function CardProduto({ produto, onSelecionar, selecionado, modoMisto }) {
  const { itens, incrementar, decrementar } = useCarrinho();

  const itemCarrinho = itens.find(i => i.id === produto.id);

  return (
    <Card sx={{ border: selecionado ? "2px solid #1976d2" : "none" }}>
      <CardMedia component="img" height="160" image={produto.img} />

      <CardContent>
        <Typography fontWeight="bold">
          {produto.nome}
        </Typography>

        <Typography variant="body2" color="text.secondary" >
          {produto.descricao}
        </Typography>

        <Typography color="primary" fontWeight="bold">
          R$ {produto.valor.toFixed(2)}
        </Typography>
      </CardContent>

      {!itemCarrinho ? (
        <Button fullWidth variant="contained" onClick={onSelecionar}>
          {modoMisto ? "Selecionar" : "Adicionar"}
        </Button>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => decrementar(itemCarrinho.id)}>
            <RemoveIcon />
          </IconButton>
          <Typography>{itemCarrinho.quantidade}</Typography>
          <IconButton onClick={() => incrementar(itemCarrinho.id)}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
    </Card>
  );
}

