import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import lojas from "../../services/IdLojas.services";

export default function Lojas() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        gap: 3,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        p: 3
      }}
    >
      <Typography variant="h4" mb={3}>
        Escolha uma loja
      </Typography>

      {lojas.map((loja) => (
        <Card>
          <CardActionArea
            onClick={() => navigate(`/${loja.idLoja}`)}
          >
            <CardMedia
              component="img"
              height="160"
              image={loja.img}
              alt={loja.nome}
            />

            <CardContent>
              <Typography variant="h6">
                {loja.nome}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {loja.descricao}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
