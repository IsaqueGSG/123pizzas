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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>
        Escolha uma loja
      </Typography>

      <Grid container spacing={3}>
        {lojas.map((loja) => (
          <Grid item xs={12} sm={6} md={4} key={loja.idLoja}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
