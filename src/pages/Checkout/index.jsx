import { useCarrinho } from "../../contexts/CarrinhoContext";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { criarPedido } from "../../services/pedido.service";
const Checkout = () => {
  const {
    itens,
    total,
    incrementar,
    decrementar,
    limparCarrinho
  } = useCarrinho();

  async function finalizarPedido() {
    await criarPedido({
      cliente: {
        nome: "Cliente balcão",
        telefone: ""
      },
      itens,
      total
    });

    limparCarrinho();
    alert("Pedido enviado com sucesso!");
  }

  return (
    <Box sx={{ p: 2 }}>

      <Navbar />
      <Toolbar />
      <CarrinhoDrawer />


      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Resumo do pedido
      </Typography>

      {/* LISTA DE ITENS */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold">
            Seu pedido
          </Typography>

          <Divider sx={{ my: 1 }} />

          {itens.length === 0 && (
            <Typography color="text.secondary">
              Seu carrinho está vazio
            </Typography>
          )}

          {itens.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1
              }}
            >
              <Avatar
                src={item.img}
                variant="rounded"
                sx={{ width: 48, height: 48, mr: 1 }}
              />

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontSize={14} fontWeight="bold">
                  {item.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  R$ {item.preco.toFixed(2)}
                </Typography>
              </Box>

              {/* CONTROLES */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => decrementar(item.id)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography fontWeight="bold">
                  {item.quantidade}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => incrementar(item.id)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 1 }} />

          {/* TOTAL */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <Typography fontWeight="bold">Total</Typography>
            <Typography fontWeight="bold">
              R$ {total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* DADOS DO CLIENTE */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Dados para entrega
          </Typography>

          <TextField
            label="Nome"
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            label="Telefone"
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            label="Endereço"
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            label="Observação"
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </CardContent>
      </Card>

      {/* FINALIZAR */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={itens.length === 0}
        onClick={finalizarPedido}
      >
        Finalizar pedido
      </Button>
    </Box>
  );
};

export default Checkout;
