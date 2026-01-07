import { useCarrinho } from "../../contexts/CarrinhoContext";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Button } from "@mui/material";

const tamanhosPizza = {
  Broto: { nome: "Broto", fator: 0.75 },
  Familia: { nome: "Família", fator: 1 }
};

export default function CardProduto({ produto, tamanhoPadrao }) {

  console.log(produto)

  const {
    itens,
    addItem,
    incrementar,
    decrementar
  } = useCarrinho();

  const tamanho = tamanhosPizza[tamanhoPadrao] || tamanhosPizza.Familia;
  const precoFinal = produto.valor * tamanho.fator;

  const itemId = `${produto.id}-${tamanhoPadrao}`;

  const itemNoCarrinho = itens.find(i => i.id === itemId);

  const adicionarAoCarrinho = () => {
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
        display: "flex",
        alignItems: "center",
        p: 1.5,
        mb: 1,
        borderRadius: 2
      }}
    >
      {/* IMAGEM */}
      <Avatar
        src={produto.img}
        variant="rounded"
        sx={{ width: 56, height: 56, mr: 1.5 }}
      />

      {/* INFO */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography fontWeight="bold" fontSize={14}>
          {produto.nome}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          R$ {precoFinal.toFixed(2)}
        </Typography>

        {
          produto.ingredientes && (
            <Typography variant="body2" color="text.secondary">
              {produto.ingredientes}
            </Typography>
          )
        }
      </Box>

      {/* CONTROLES */}
      {!itemNoCarrinho ? (
        <Button variant="contained" onClick={adicionarAoCarrinho}>
          Adicionar
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          <IconButton
            size="small"
            onClick={() => decrementar(itemId)}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography>{itemNoCarrinho.quantidade}</Typography>

          <IconButton
            size="small"
            onClick={() => incrementar(itemId)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Card>
  );
}
