import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Collapse
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { useState } from "react";
import { useCarrinho } from "../../contexts/CarrinhoContext";

const IMG_FALLBACK =
  "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"; // talheres/comida

export default function CardProduto({ produto, onSelecionar, selecionado, modoMisto, foraDeHorario }) {
  const { itens, incrementar, decrementar } = useCarrinho();
  const [expandir, setExpandir] = useState(false);
  const [imgError, setImgError] = useState(false);

  const itemCarrinho = itens.find(i => i.id === produto.id);

  return (
    <Card
      sx={{
        border: selecionado ? "2px solid #1976d2" : "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "0.2s",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      {/* Imagem com fallback */}
      {produto.img && !imgError ? (
        <CardMedia
          component="img"
          image={produto.img}
          onError={() => setImgError(true)}
          sx={{
            height: { xs: 100, sm: 120, md: 160 },
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            height: { xs: 100, sm: 120, md: 160 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f5f5f5",
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 40, color: "#bdbdbd" }} />
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          p: 1, // antes era padrão (16px)
          "&:last-child": { pb: 1 },
        }}
      >
        {/* Nome + seta */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            fontWeight="bold"
            sx={{
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {produto.nome}
          </Typography>

          {produto.descricao && (
            <IconButton
              size="small"
              onClick={() => setExpandir(!expandir)}
              sx={{
                transition: "0.3s",
                transform: expandir ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Descrição colapsável */}
        {produto.descricao && (
          <Collapse in={expandir}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.4 }}
            >
              {produto.descricao}
            </Typography>
          </Collapse>
        )}
      </CardContent>

      {/* Rodapé profissional: preço + ações */}
      <Box
        sx={{
          mt: "auto",
          p: 1,
          pt: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.5, // menor gap
        }}
      >
        {/* Preço acima */}
        <Typography
          color="primary"
          fontWeight="bold"
          sx={{
            fontSize: 16, // antes 18
            whiteSpace: "nowrap",
          }}
        >
          R$ {produto.valor.toFixed(2)}
        </Typography>

        {/* Botão ou Controle */}
        {!itemCarrinho ? (
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={onSelecionar}
            disabled={foraDeHorario}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            {modoMisto ? "Selecionar" : "Adicionar"}
          </Button>
        ) : (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              px: 1,
              py: 0.3,
            }}
          >
            <IconButton
              size="small"
              onClick={() => decrementar(itemCarrinho.id)}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Typography fontWeight="bold" fontSize={16}>
              {itemCarrinho.quantidade}
            </Typography>

            <IconButton
              size="small"
              onClick={() => incrementar(itemCarrinho.id)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Card>
  );
}