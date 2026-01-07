import { useCarrinho } from "../../contexts/CarrinhoContext";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const tamanhosPizza = {
  pizza: { nome: "Família", fator: 1 },
  broto: { nome: "Broto", fator: 0.75 }
};

export default function CardProduto({
  produto,
  categoria,
  tipoPizza,
  saboresSelecionados,
  onSelecionarSabor
}) {
  const { itens, addItem, incrementar, decrementar } = useCarrinho();

  const isPizza = produto.tipo === "pizza";
  const isMeia = tipoPizza === "1/2";

  const tamanho = isPizza ? tamanhosPizza[categoria] : null;
  const precoFinal = isPizza ? produto.valor * tamanho.fator : produto.valor;

  const selecionado = saboresSelecionados?.some(
    (p) => p.id === produto.id
  );

  const itemId = isPizza
    ? `${produto.id}-${categoria}`
    : `${produto.id}`;

  const itemNoCarrinho = itens.find((i) => i.id === itemId);

  const adicionar = () => {
    // BEBIDA
    if (!isPizza) {
      addItem({
        id: itemId, // ✅ usa o mesmo ID
        nome: produto.nome,
        preco: produto.valor,
        quantidade: 1,
        img: produto.img
      });
      return;
    }

    // PIZZA INTEIRA
    addItem({
      id: itemId,
      nome: `${produto.nome} (${tamanho.nome})`,
      preco: precoFinal,
      quantidade: 1,
      img: produto.img
    });
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: selecionado ? "2px solid" : "1px solid",
        borderColor: selecionado ? "primary.main" : "divider",
        opacity:
          isMeia &&
            saboresSelecionados.length === 2 &&
            !selecionado
            ? 0.5
            : 1
      }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          height="160"
          image={produto.img}
          alt={produto.nome}
        />

        <CardContent>
          <Typography fontWeight="bold">
            {produto.nome}
          </Typography>

          <Typography color="primary" fontWeight="bold">
            R$ {precoFinal.toFixed(2)}
          </Typography>

          {produto.ingredientes && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {produto.ingredientes}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: "center" }}>
        {isMeia ? (
          <Button
            fullWidth
            variant={selecionado ? "outlined" : "contained"}
            onClick={() => onSelecionarSabor(produto)}
          >
            {selecionado ? "Remover sabor" : "Escolher sabor"}
          </Button>
        ) : !itemNoCarrinho ? (
          <Button
            fullWidth
            variant="contained"
            onClick={adicionar}
          >
            Adicionar
          </Button>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => decrementar(itemId)}>
              <RemoveIcon />
            </IconButton>
            <Typography fontWeight="bold">
              {itemNoCarrinho.quantidade}
            </Typography>
            <IconButton onClick={() => incrementar(itemId)}>
              <AddIcon />
            </IconButton>
          </Box>
        )}
      </CardActions>
    </Card>
  );
}
