import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
  Chip,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import BoltIcon from "@mui/icons-material/Bolt";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { useNavigate } from "react-router-dom";

import { getLojas } from "../../services/lojas.service";

export default function Landing() {

  const [lojas, setLojas] = useState([]);
  // ⭐ carregar lista de lojas (necessário para Electron)
  useEffect(() => {
    async function carregarLojas() {
      const data = await getLojas();
      setLojas(data);
    }

    carregarLojas();
  }, []);

  const navigate = useNavigate();

  const PLANOS = [
    {
      id: "basico",
      nome: "Básico",
      preco: 100,
      precoFormatado: "R$100/mês",
      features: [
        "Cardápio digital",
        "Painel admin",
        "Pedidos WhatsApp"
      ]
    },
    {
      id: "profissional",
      nome: "Profissional",
      preco: 150,
      precoFormatado: "R$150/mês",
      destaque: true,
      features: [
        "Tudo do básico",
        "Pedidos automáticos",
        "Impressão automática",
        "Mensagens automáticas"
      ]
    }
  ];

  const features = [
    {
      title: "Cardápio Digital Personalizado",
      description: "Crie e gerencie seu cardápio completo de forma intuitiva",
      icon: <StorefrontIcon fontSize="large" color="primary" />
    },
    {
      title: "Painel Admin Completo",
      description: "Controle total sobre pedidos, produtos e estatísticas da sua loja",
      icon: <DashboardIcon fontSize="large" color="primary" />
    },
    {
      title: "Pedidos em Tempo Real",
      description: "Receba notificações instantâneas de novos pedidos",
      icon: <ShoppingCartIcon fontSize="large" color="primary" />
    },
    {
      title: "Integração com WhatsApp",
      description: "Pedidos enviados automaticamente para seu WhatsApp",
      icon: <WhatsAppIcon fontSize="large" color="primary" />
    },
    {
      title: "Gestão Completa",
      description: "Organize categorias, produtos e promoções facilmente",
      icon: <LayersIcon fontSize="large" color="primary" />
    },
    {
      title: "Multi-loja (SaaS)",
      description: "Gerencie múltiplas lojas em uma única plataforma",
      icon: <BoltIcon fontSize="large" color="primary" />
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0B1120 0%, #1A1F2E 100%)",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "radial-gradient(circle at 30% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                Sistema profissional para{' '}
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      bgcolor: 'primary.main',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Delivery e Cardápio Digital
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: '600px'
                }}
              >
                Gerencie sua loja e receba pedidos diretamente no WhatsApp com um sistema moderno, rápido e intuitivo.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 6 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RestaurantMenuIcon />}
                  onClick={() => navigate("/demo")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: 4,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 8
                    }
                  }}
                >
                  Ver Demonstração
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Área do Admin
                </Button>
              </Stack>


            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box sx={{ py: 12, backgroundColor: '#F9FAFB' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Tudo que sua loja precisa em um só lugar
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '700px', mx: 'auto' }}
            >
              Do cardápio ao pedido automático, tudo integrado em um único sistema.
            </Typography>
          </Box>

          <Grid display={"flex"} justifyContent={"center"} container spacing={3}>
            {features.map((item, index) => (
              <Grid key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: 'primary.main',
                      '& .feature-icon': {
                        transform: 'scale(1.1)',
                        color: 'primary.main'
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Ícone à esquerda */}
                    <Box
                      className="feature-icon"
                      sx={{
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Texto à direita */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* DEMO STORES */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>

            <Typography
              variant="h3"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Lojas que confiam no nosso sistema
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '700px', mx: 'auto' }}
            >
              Conheça alguns estabelecimentos que já estão utilizando nossa plataforma.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={4}>
              {lojas.filter((loja) => loja.idLoja !== "demo").map((loja) => (
                <Grid key={loja.idLoja}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => navigate(`/${loja.idLoja}`)}
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        height: 320,       // altura padrão
                        width: 260,        // largura padrão
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 12,
                          '& .store-overlay': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      {/* Imagem topo */}
                      <Box
                        sx={{
                          height: 160,
                          background: loja.img
                            ? `url(${loja.img}) center/cover`
                            : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': loja.img ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.25)' // overlay leve
                          } : {}
                        }}
                      />

                      {/* Conteúdo */}
                      <CardContent
                        sx={{
                          textAlign: 'center',
                          position: 'relative',
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {loja.nome}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {loja.descricao}
                        </Typography>

                        {/* Botão elegante */}
                        <Button
                          variant="contained"
                          size="medium"
                          sx={{
                            borderRadius: 3,
                            fontWeight: 600,
                            textTransform: "none",
                            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                            color: "white",
                            boxShadow: 4,
                            "&:hover": {
                              background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                              boxShadow: 8,
                              transform: "scale(1.03)"
                            }
                          }}
                        >
                          Ver Cardápio
                        </Button>
                      </CardContent>

                      {/* Overlay ao passar o mouse */}
                      <Box
                        className="store-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(37, 99, 235, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          color: 'white',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <RestaurantMenuIcon sx={{ fontSize: 40 }} />
                        <Typography variant="h6">Visualizar Cardápio</Typography>
                      </Box>
                    </Card>
                  </Grid>

                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* PRICING SECTION */}
      <Box sx={{ py: 12, backgroundColor: '#F9FAFB' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: 2
              }}
            >
              PLANOS
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Escolha o plano ideal para seu negócio
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">

            {
              PLANOS.map((plano) => (
                <Grid key={plano.id} item xs={12} sm={6} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column', // organiza em coluna
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8
                      }
                    }}
                  >
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {plano.nome.toUpperCase()}
                    </Typography>

                    <Box sx={{ my: 3 }}>
                      <Typography component="span" variant="h3" sx={{ fontWeight: 700 }}>
                        {plano.precoFormatado}
                      </Typography>
                    </Box>

                    <Stack spacing={2} sx={{ my: 4 }}>
                      {plano.features.map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span" sx={{ color: 'success.main', fontSize: 20 }}>✓</Box>
                          <Typography>{feature}</Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* O segredo está aqui */}
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      onClick={() => navigate(`/registro-saas?p=${plano.id}`)}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        mt: 'auto' // empurra o botão para o final
                      }}
                    >
                      Começar Agora
                    </Button>
                  </Card>

                </Grid>
              ))
            }

          </Grid>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1120 0%, #1A1F2E 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at 70% 50%, rgba(37, 99, 235, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Pronto para profissionalizar sua loja?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 5,
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Sistema completo entregue e configurado para sua loja em até 24 horas.
            Comece a vender mais hoje mesmo!
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            onClick={() => window.open(`https://wa.me/5511958077745?text=Olá, gostaria de mais informações sobre o plano de assinatura.`, "_blank")}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: 8,
              backgroundColor: '#25D366',
              '&:hover': {
                backgroundColor: '#128C7E',
                transform: 'translateY(-2px)',
                boxShadow: 12
              }
            }}
          >
            Falar com Consultor
          </Button>

          <Typography
            variant="body2"
            sx={{
              mt: 3,
              opacity: 0.7
            }}
          >
            ✓ Atendimento personalizado  ✓ Sem compromisso  ✓ Tire suas dúvidas
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}