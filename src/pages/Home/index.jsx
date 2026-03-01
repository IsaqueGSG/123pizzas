import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import lojas from "../../services/IdLojas.services";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box>

      {/* HERO */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #111827, #1f2937)",
          color: "white",
          py: 12,
          textAlign: "center"
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold">
            Sistema profissional para Delivery
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, opacity: 0.8 }}>
            Cardápio digital, painel administrativo completo e pedidos
            automáticos via WhatsApp.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 5 }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{ px: 5, py: 1.5 }}
              onClick={() => navigate("/demo")}
            >
              Ver Demonstração
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                color: "white",
                borderColor: "white"
              }}
              onClick={() => navigate("/login")}
            >
              Área do Admin
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* FUNCIONALIDADES */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>
          Tudo que sua loja precisa
        </Typography>

        <Grid container spacing={4}>
          {[
            "Cardápio digital personalizado",
            "Painel admin completo",
            "Pedidos em tempo real",
            "Integração automática com WhatsApp",
            "Gestão de categorias e produtos",
            "Multi-loja (SaaS)"
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  border: "1px solid #eee",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)"
                  }
                }}
              >
                <Typography fontWeight="bold">{item}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* LOJAS DEMO */}
      <Box sx={{ backgroundColor: "#f9fafb", py: 10 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" mb={6} textAlign="center">
            Lojas utilizando o sistema
          </Typography>

          <Grid container spacing={4}>
            {lojas.map((loja) => (
              <Grid item xs={12} sm={6} md={4} key={loja.idLoja}>
                <Card
                  sx={{
                    cursor: "pointer",
                    p: 3,
                    transition: "0.3s",
                    "&:hover": {
                      boxShadow: 8,
                      transform: "translateY(-6px)"
                    }
                  }}
                  onClick={() => navigate(`/${loja.idLoja}`)}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {loja.nome}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Clique para ver o cardápio
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PLANOS */}
      <Container sx={{ py: 12 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>
          Plano Profissional
        </Typography>

        <Box display="flex" justifyContent="center">
          <Card
            sx={{
              maxWidth: 400,
              p: 4,
              textAlign: "center",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 4,
              boxShadow: 6
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold">
                Plano Único
              </Typography>

              <Typography
                variant="h3"
                color="primary"
                fontWeight="bold"
                sx={{ mt: 2 }}
              >
                R$ 100
              </Typography>

              <Typography color="text.secondary">por mês</Typography>

              <Divider sx={{ my: 3 }} />

              <Typography>
                ✔ Cardápio personalizado
                <br />
                ✔ Admin completo
                <br />
                ✔ Pedidos em tempo real
                <br />
                ✔ Integração WhatsApp
                <br />
                ✔ Suporte e atualizações
              </Typography>

              <Button
                variant="contained"
                size="large"
                sx={{ mt: 4 }}
              >
                Quero meu sistema
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* CTA FINAL */}
      <Box
        sx={{
          background: "#111827",
          color: "white",
          py: 8,
          textAlign: "center"
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Pronto para profissionalizar sua loja?
        </Typography>

        <Typography sx={{ mt: 2, opacity: 0.8 }}>
          Sistema pronto em até 24h para sua empresa.
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 4 }}
        >
          Falar no WhatsApp
        </Button>
      </Box>

    </Box>
  );
}