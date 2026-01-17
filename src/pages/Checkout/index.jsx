import { useCarrinho } from "../../contexts/CarrinhoContext";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import MapaEntrega from "../../components/Mapa";

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
import { Tab, Tabs } from "@mui/material"

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useNavigate } from "react-router-dom";

import { criarPedido } from "../../services/pedidos.service";
import { useEffect, useState } from "react";


const Checkout = () => {
  const navigate = useNavigate();

  const {
    itens,
    total,
    incrementar,
    decrementar,
    limparCarrinho
  } = useCarrinho();

  const [aba, setAba] = useState(0)
  const [enderecoEntrega, setEnderecoEntrega] = useState(null);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const valorTotalCarrinho = itens.reduce(
    (total, item) => total + Number(item.valor) * Number(item.quantidade),
    0
  );

  const valorTotalPedido = valorTotalCarrinho + taxaEntrega;

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    observacao: ""
  });

  async function finalizarPedido() {

    if (!enderecoEntrega?.endereco?.rua) {
      alert("Informe o endereço de entrega no mapa");
      setAba(1);
      return;
    }

    if (!enderecoEntrega?.endereco?.numero) {
      alert("Informe o numero do endereço");
      setAba(1);
      return;
    }

    if (!cliente.nome || !cliente.telefone) {
      alert("Informe nome e telefone");
      setAba(2);
      return;
    }

    await criarPedido({
      cliente: { ...cliente, enderecoEntrega },
      itens: itens.map(item => ({
        id: item.id,
        nome: item.nome,
        valor: item.valor,
        quantidade: item.quantidade,
        extras: item.extras ?? null
      })),
      total: valorTotalPedido,
      status: "novo",
      impresso: false,
      criadoEm: new Date()
    });

    limparCarrinho();
    alert("Pedido realizado com sucesso!!");
    navigate("/");
  }

  useEffect(() => {
    if (itens.length === 0) {
      alert("Talvez voce tenha recarregado a pagina e por isso não ha nenhum item no carrinho, então você será redirecionado");
      navigate("/");
    }
  }, [itens])

  return (
    <Box sx={{ p: 2, pb: 22 }}>

      <Navbar />
      <Toolbar />
      <CarrinhoDrawer />

      <Tabs
        value={aba}
        onChange={(_, v) => setAba(v)}
        variant="fullWidth"
      >
        <Tab label="Itens do carrinho" />
        <Tab label="Dados para entrega" />
        <Tab label="Dados do cliente" />
      </Tabs>

      {/* LISTA DE ITENS */}

      {
        aba === 0 && (

          <Card sx={{ my: 2 }}>
            <CardContent>
              {itens.length === 0 && (
                <Typography color="text.secondary">
                  Seu carrinho está vazio
                </Typography>
              )}

              {itens.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* IMAGEM */}
                    <Avatar
                      src={item.img}
                      variant="rounded"
                      sx={{ width: 64, height: 64 }}
                    />

                    {/* CONTEÚDO */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">
                        {item.nome}
                      </Typography>


                      {/* DESCRIÇÃO */}
                      {item.descricao && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {item.descricao}
                        </Typography>
                      )}

                      {/* EXTRAS / OBS */}
                      {item.extras && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.extras.borda && <>Borda: {item.extras.borda}<br /></>}
                          {item.extras.adicionais?.length > 0 && (
                            <>Extras: {item.extras.adicionais.map(e => e.nome).join(", ")}<br /></>
                          )}
                          {item.extras.obs && <>Obs: {item.extras.obs}</>}
                        </Typography>
                      )}

                    </Box>

                    {/* CONTROLES */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between"
                      }}
                    >
                      {/* CONTROLE QTD */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
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

                      <Typography fontWeight="bold">
                        R$ {(item.valor * item.quantidade).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}

              <Divider sx={{ my: 1 }} />

              {/* TOTAL */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <Typography fontWeight="bold">Total do carrinho</Typography>
                <Typography fontWeight="bold">
                  R$ {valorTotalCarrinho.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )
      }


      {/* DADOS DA ENTREGA */}
      {
        aba === 1 && (

          <Card sx={{ my: 2 }}>
            <CardContent>
              <MapaEntrega
                taxa={taxaEntrega}
                setTaxa={setTaxaEntrega}
                enderecoEntrega={enderecoEntrega}
                setEnderecoEntrega={setEnderecoEntrega}
              />

              <TextField
                label="Observação"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={cliente.observacao}
                onChange={(e) =>
                  setCliente({ ...cliente, observacao: e.target.value })
                }
              />

            </CardContent>
          </Card>

        )
      }

      {/* DADOS DO CLIENTE */}
      {
        aba === 2 && (

          <Card sx={{ my: 2 }}>
            <CardContent>
              <TextField
                label="Nome"
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                value={cliente.nome}
                onChange={(e) =>
                  setCliente({ ...cliente, nome: e.target.value })
                }
              />


              <TextField
                label="Telefone"
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                value={cliente.telefone}
                onChange={(e) =>
                  setCliente({ ...cliente, telefone: e.target.value })
                }
              />

            </CardContent>
          </Card>

        )
      }

      {/* deixar esse box fixo como se fosse um footer */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          p: 1,
          zIndex: 1200
        }}
      >

        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              Valor total do Carrinho: R$ {valorTotalCarrinho.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              Valor da Taxa de entrega: R$ {taxaEntrega.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              Valor total do pedido: R$ {valorTotalPedido.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        {/* FINALIZAR */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={itens.length === 0}
          onClick={() => {
            if (aba === 2) {
              finalizarPedido();
            } else {
              setAba(aba + 1)
            }
          }}
        >
          {aba < 2 ? "seguir para finalizar" : "Finalizar pedido"}
        </Button>
      </Box>

    </Box>
  );
};

export default Checkout;
