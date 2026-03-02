import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
  Divider,
  Chip
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNavigate } from "react-router-dom";
import lojas from "../../services/IdLojas.services";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Cardápio digital personalizado",
      icon: <StorefrontIcon fontSize="large" color="primary" />
    },
    {
      title: "Painel admin completo",
      icon: <DashboardIcon fontSize="large" color="primary" />
    },
    {
      title: "Pedidos em tempo real",
      icon: <ShoppingCartIcon fontSize="large" color="primary" />
    },
    {
      title: "Integração automática com WhatsApp",
      icon: <WhatsAppIcon fontSize="large" color="primary" />
    },
    {
      title: "Gestão de categorias e produtos",
      icon: <LayersIcon fontSize="large" color="primary" />
    },
    {
      title: "Multi-loja (SaaS)",
      icon: <BoltIcon fontSize="large" color="primary" />
    }
  ];

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          background:
            "radial-gradient(circle at top, #1f2937, #020617 70%)",
          color: "white",
          height: "100vh",
          py: { xs: 3, md: 14 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight="bold"
          >
            Sistema profissional para
            <br />
            <Box component="span" color="primary.main">
              Delivery e Cardápio Digital
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{ mt: 3, opacity: 0.85 }}
          >
            Gerencie sua loja e receba pedidos diretamente no WhatsApp com um sistema moderno e rápido.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 1.8,
                fontWeight: "bold",
                borderRadius: 3,
                fontSize: 16,
                boxShadow: 6
              }}
              onClick={() => navigate("/demo")}
            >
              Ver Demonstração
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 6,
                py: 1.8,
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                borderRadius: 3,
                "&:hover": {
                  borderColor: "white",
                  background: "rgba(255,255,255,0.05)"
                }
              }}
              onClick={() => navigate("/login")}
            >
              Área do Admin
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* FUNCIONALIDADES */}
      <Container sx={{ backgroundColor: "#f8fafc", py: 12 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={2}
        >
          Tudo que sua loja precisa em um só lugar
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          mb={8}
        >
          Do cardápio ao pedido automático, tudo integrado em um único sistema.
        </Typography>

        <Grid container justifyContent="center" spacing={4}>
          {features.map((item, index) => (
            <Grid display={"flex"} justifyContent="center" item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                  "&:hover": {
                    boxShadow: 8,
                    transform: "translateY(-6px)",
                    borderColor: "primary.main"
                  }
                }}
              >
                <Box mb={2}>{item.icon}</Box>
                <Typography fontWeight="bold" fontSize={18}>
                  {item.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* LOJAS DEMO */}
      <Box sx={{ backgroundColor: "#f8fafc", py: 12 }}>
        <Container>
          <Typography
            variant="h4"
            fontWeight="bold"
            mb={2}
            textAlign="center"
          >
            Lojas utilizando o sistema
          </Typography>

          <Typography
            textAlign="center"
            color="text.secondary"
            mb={8}
          >
            Veja exemplos reais de lojas utilizando o sistema.
          </Typography>

          <Grid container justifyContent="center" spacing={4}>
            {lojas.map((loja) => (
              <Grid display={"flex"} justifyContent="center" item xs={12} sm={6} md={4} key={loja.idLoja}>
                <Card
                  sx={{
                    cursor: "pointer",
                    p: 4,
                    width: "100%",
                    borderRadius: 4,
                    transition: "all 0.3s ease",
                    border: "1px solid #e5e7eb",
                    "&:hover": {
                      boxShadow: 10,
                      transform: "translateY(-8px) scale(1.02)"
                    }
                  }}
                  onClick={() => navigate(`/${loja.idLoja}`)}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {loja.nome}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Clique para ver o cardápio da loja
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PLANOS */}
      <Container sx={{ backgroundColor: "#f8fafc", py: 14 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={8}
        >
          Escolha o melhor plano para você
        </Typography>

        <Grid
          container
          spacing={4}
          justifyContent="center"
        >
          {/* PLANO BÁSICO */}
          <Grid item xs={12} md={5} display="flex" justifyContent="center">
            <Card
              sx={{
                p: 5,
                width: "100%",
                maxWidth: 420,
                borderRadius: 5,
                border: "1px solid #e5e7eb",
                textAlign: "center"
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Plano Básico
              </Typography>

              <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                R$100
              </Typography>

              <Typography color="text.secondary">
                por mês
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Stack spacing={1}>
                <Typography>✔ Cardápio digital</Typography>
                <Typography>✔ Painel administrativo</Typography>
                <Typography>✔ Pedidos via WhatsApp</Typography>
                <Typography>✔ Suporte básico</Typography>
              </Stack>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{ mt: 4, borderRadius: 3 }}
                onClick={() => window.open(
                  `https://wa.me/5511958077745?text=Olá, gostaria de assinar o plano básico do 123pedidos`,
                  "_blank"
                )}
              >
                Começar agora
              </Button>
            </Card>
          </Grid>

          {/* PLANO PROFISSIONAL */}
          <Grid item xs={12} md={5} display="flex" justifyContent="center">
            <Card
              sx={{
                p: 5,
                width: "100%",
                maxWidth: 420,
                borderRadius: 5,
                textAlign: "center",
                border: "2px solid",
                borderColor: "primary.main",
                boxShadow: 12,
                position: "relative",
                background:
                  "linear-gradient(135deg, #ffffff, #f9fafb)"
              }}
            >
              <Chip
                label="Mais escolhido"
                color="primary"
                sx={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontWeight: "bold"
                }}
              />

              <Typography variant="h5" fontWeight="bold">
                Plano Profissional
              </Typography>

              <Typography
                variant="h2"
                color="primary"
                fontWeight="bold"
                sx={{ mt: 2 }}
              >
                R$150
              </Typography>

              <Typography color="text.secondary">
                por mês
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Stack spacing={1}>
                <Typography>✔ Tudo do plano básico</Typography>
                <Typography>+</Typography>
                <Typography>✔ Pedidos aceitos automaticamente</Typography>
                <Typography>✔ Impressão automática</Typography>
                <Typography>✔ Mensagens automáticas</Typography>
                <Typography>✔ Suporte prioritário 24 horas</Typography>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 5,
                  borderRadius: 3,
                  fontWeight: "bold"
                }}
                onClick={() => window.open(
                  `https://wa.me/5511958077745?text=Olá, gostaria de assinar o plano profissional do 123pedidos`,
                  "_blank"
                )}
              >
                Quero esse plano
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA FINAL */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #020617, #111827)",
          color: "white",
          py: 10,
          textAlign: "center"
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight="bold">
            Pronto para profissionalizar sua loja?
          </Typography>

          <Typography sx={{ mt: 2, opacity: 0.8 }}>
            Sistema completo entregue e configurado para sua loja em até 24 horas.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            onClick={() => window.open(
              `https://wa.me/5511958077745?text=Olá, gostaria de mais informações sobre o 123pedidos`,
              "_blank"
            )}
            sx={{
              mt: 5,
              px: 6,
              py: 1.8,
              borderRadius: 3,
              fontWeight: "bold",
              fontSize: 16,
              boxShadow: 8
            }}
          >
            Falar no WhatsApp
          </Button>
        </Container>
      </Box>
    </Box>
  );
}