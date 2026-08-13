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

export default function CardProduto({ produto, destacado,onSelecionar, selecionado, modoMisto, foraDeHorario }) {
  const { itens, incrementar, decrementar } = useCarrinho();
  const [expandir, setExpandir] = useState(false);
  const [imgError, setImgError] = useState(false);

  const itemCarrinho = itens.find(i =>
    i.id.startsWith(produto.id)
  );

  const temExtras = produto?.categoria?.gruposExtras?.length > 0;

  const itensDoProduto = itens.filter(i =>
    i.id.startsWith(produto.id)
  );

  const quantidadeTotal = itensDoProduto.reduce(
    (acc, i) => acc + i.quantidade,
    0
  );

  return (
    <Card
      sx={{
        border: selecionado || destacado ? "2px solid #1976d2" : "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "0.2s",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      {/* Container da Imagem mais compacto */}
      <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
        {produto.img && !imgError ? (
          <CardMedia
            component="img"
            loading="lazy"
            image={produto.img}
            onError={() => setImgError(true)}
            sx={{
              height: { xs: 90, sm: 105, md: 120 }, // Altura reduzida para evitar espaços vazios
              objectFit: "cover",
              width: "100%",
            }}
          />
        ) : (
          <Box
            sx={{
              height: { xs: 90, sm: 105, md: 120 }, // Altura proporcional para o fallback
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f5f5f5",
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 50, color: "#bdbdbd" }} />
          </Box>
        )}

        {/* Descrição flutuante sobre a imagem quando expandida */}
        {produto.descricao && (
          <Collapse 
            in={expandir} 
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              overflowY: "auto",
              zIndex: 2,
              borderTop: "1px solid #ddd",
            }}
          >
            <Box sx={{ p: 0.8 }}>
              <Typography
                color="text.secondary"
              >
                {produto.descricao}
              </Typography>
            </Box>
          </Collapse>
        )}
      </Box>

      {/* Conteúdo principal compacto */}
      <CardContent
        sx={{
          flexGrow: 1,
          p: 1,
          "&:last-child": { pb: 1 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography
            fontWeight="bold"
            sx={{
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
                p: 0.5,
                transition: "0.3s",
                transform: expandir ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>

      {/* Rodapé compacto */}
      <Box
        sx={{
          mt: "auto",
          p: 1,
          pt: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography
          color="primary"
          fontWeight="bold"
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          R$ {produto.valor.toFixed(2)}
        </Typography>

        {temExtras ? (
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={onSelecionar}
            disabled={foraDeHorario}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {modoMisto ? "Selecionar" : "Adicionar"}
          </Button>
        ) : !itemCarrinho ? (
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={onSelecionar}
            disabled={foraDeHorario}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Adicionar
          </Button>
        ) : (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #e0e0e0",
              borderRadius: 1.5,
              px: 0.5,
              py: 0.1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => decrementar(itemCarrinho.id)}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Typography fontWeight="bold" fontSize={15}>
              {quantidadeTotal}
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