import { useCarrinho } from "../../contexts/CarrinhoContext";
import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import MapaEntrega from "../../components/EnderecoEntega";

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
import { Tab, Tabs, MenuItem } from "@mui/material"

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useNavigate } from "react-router-dom";

import { criarPedido } from "../../services/pedidos.service";
import { useEffect, useState } from "react";
import { useRef } from "react";

import { useLoja } from "../../contexts/LojaContext";
import { useEntrega } from "../../contexts/EntregaContext";

export default function Checkout() {
  const { idLoja } = useLoja()
  const { endereco, clearEndereco } = useEntrega()

  const navigate = useNavigate();
  const pedidoFinalizadoRef = useRef(false);

  const {
    itens,
    total,
    incrementar,
    decrementar,
    limparCarrinho
  } = useCarrinho();

  console.log("Itens no carrinho:", itens);

  const [aba, setAba] = useState(0)
  const valorTotalCarrinho = itens.reduce(
    (total, item) => total + Number(item.valor) * Number(item.quantidade),
    0
  );

  const valorTotalPedido = valorTotalCarrinho + endereco.taxaEntrega;

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    formaPagamento: {
      forma: "", obsPagamento: ""
    }
  });

  const validacoes = () => {

    if (!endereco?.rua) {
      alert("Informe o endereço de entrega");
      setAba(1);
      return false;
    }

    if (!endereco?.numero) {
      alert("Informe o numero do endereço");
      setAba(1);
      return false;
    }

    if (!endereco || endereco.taxaEntrega <= 0) {
      alert("Calcule a taxa de entrega antes de continuar");
      setAba(1);
      return false;
    }

    if (!cliente.nome || !cliente.telefone) {
      alert("Informe nome e telefone");
      setAba(2);
      return false;
    }

    if (!cliente.formaPagamento.forma) {
      alert("Selecione a forma de pagamento");
      setAba(2);
      return false;
    }

    if (
      cliente.formaPagamento.forma === "DINHEIRO" &&
      !cliente.formaPagamento.obsPagamento
    ) {
      alert("Informe o valor para troco");
      return false;
    }

    return true;
  };


  async function finalizarPedido() {
    const ok = validacoes();
    if (!ok) return;

    pedidoFinalizadoRef.current = true;

    const pedido = {
      cliente: { ...cliente, endereco },
      itens: itens.map(item => ({ ...item })), 
      total: valorTotalPedido,
      status: "novo",
      impresso: false,
      criadoEm: new Date()
    }


    await criarPedido(idLoja, pedido);
    console.log("Pedido criado:", pedido);

    limparCarrinho();
    clearEndereco();
    alert("Pedido realizado com sucesso!!");
    navigate(`/${idLoja}`);
  }


  useEffect(() => {
    if (itens.length === 0 && !pedidoFinalizadoRef.current) {
      alert("!você será redirecionado!\n\nTalvez você tenha recarregado a página e por isso o carrinho foi esvaziado.");
      navigate(`/${idLoja}`);
    }
  }, [itens]);

  const getTextoBotao = () => {
    if (aba === 0) return "Continuar para entrega";
    if (aba === 1) return "Continuar para dados do cliente";
    return "Finalizar pedido";
  };

  const formasPagamento = ["PIX", "DINHEIRO", "CARTÃO"]

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
                      {item.extras && item.extras.length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Extras: {item.extras.map(e => e.nome).join(", ")}<br />
                        </Typography>
                      )}

                      {item.obs && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Obs: {item.obs}
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
              <MapaEntrega />
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

              <TextField
                label="Forma de pagamento"
                select
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                value={cliente.formaPagamento.forma}
                onChange={(e) =>
                  setCliente({
                    ...cliente,
                    formaPagamento: {
                      ...cliente.formaPagamento,
                      forma: e.target.value,
                      obsPagamento: "" // limpa ao trocar
                    }
                  })
                }
              >
                {formasPagamento.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>


              {cliente.formaPagamento.forma === "DINHEIRO" && (
                <TextField
                  label="Troco para quanto?"
                  fullWidth
                  size="small"
                  value={cliente.formaPagamento.obsPagamento}
                  onChange={(e) =>
                    setCliente({
                      ...cliente,
                      formaPagamento: {
                        ...cliente.formaPagamento,
                        obsPagamento: e.target.value
                      }
                    })
                  }
                />
              )}

              {cliente.formaPagamento.forma === "PIX" && (
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  PIX será enviado após confirmação do pedido
                </Typography>
              )}

              {cliente.formaPagamento.forma === "CARTÃO" && (
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  Levar maquininha de cartão
                </Typography>
              )}

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
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
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
              Valor da Taxa de entrega: R$ {endereco.taxaEntrega.toFixed(2)}
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
              return finalizarPedido();
            }

            setAba(aba + 1);
          }}

        >
          {getTextoBotao()}
        </Button>
      </Box>

    </Box >
  );
};


