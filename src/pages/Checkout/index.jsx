import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import { FormControlLabel } from "@mui/material";
import { Tab, Tabs, MenuItem, CircularProgress, Checkbox } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";

import { useLoja } from "../../contexts/LojaContext";
import { useEntrega } from "../../contexts/EntregaContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";

import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import MapaEntrega from "../../components/EnderecoEntega";

import { criarPedido, buscarUltimoEnderecoPorTelefone } from "../../services/pedidos.service";

export default function Checkout() {
  const { idLoja } = useLoja();
  const { enderecoLoja, endereco, clearEndereco, setEndereco } = useEntrega(); // certifique-se que setEndereco vem do seu context

  const enderecoTexto = enderecoLoja
    ? `${enderecoLoja.rua}, ${enderecoLoja.numero} - ${enderecoLoja.bairro} / ${enderecoLoja.cidade} - ${enderecoLoja.uf}`
    : "";

  const [checkTroco, setCheckTroco] = useState(false);
  const [checkRetirarLoja, setCheckRetirarLoja] = useState(false);
  const [aba, setAba] = useState(0);
  const [carregandoEnvio, setCarregandoEnvio] = useState(false);

  const navigate = useNavigate();
  const pedidoFinalizadoRef = useRef(false);

  const {
    itens,
    incrementar,
    decrementar,
    limparCarrinho
  } = useCarrinho();

  const valorTotalCarrinho = itens.reduce(
    (total, item) =>
      total + Number(item.valor ?? 0) * Number(item.quantidade ?? 1),
    0
  );

  // CORREÇÃO: Se for retirada, ignora a taxa de entrega no cálculo visual
  const taxaEntregaEfetiva = checkRetirarLoja ? 0 : (endereco?.taxaEntrega ?? 0);
  const valorTotalPedido = valorTotalCarrinho + taxaEntregaEfetiva;

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    formaPagamento: {
      forma: "",
      obsPagamento: ""
    }
  });

  function limparTelefone(valor) {
    return valor.replace(/\D/g, "");
  }

  function formatarTelefone(valor) {
    let numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length === 0) return "";
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6) return numeros.replace(/(\d{2})(\d+)/, "($1) $2");
    if (numeros.length <= 10) return numeros.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    return numeros.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
  }

  const telefoneLimpo = useMemo(
    () => limparTelefone(cliente.telefone),
    [cliente.telefone]
  );

  const telefoneValido = /^\d{10,11}$/.test(telefoneLimpo);

  // AJUSTE: Validações isoladas por etapa/aba para melhor experiência de usuário
  const validarAbaItens = () => {
    if (itens.length === 0) {
      alert("Seu carrinho está vazio.");
      return false;
    }
    return true;
  };

  const validarAbaCliente = () => {
    if (!cliente.nome.trim()) {
      alert("Informe o nome do cliente.");
      return false;
    }
    if (!cliente.telefone) {
      alert("Informe o telefone.");
      return false;
    }
    if (!telefoneValido) {
      alert("Telefone inválido. Certifique-se de incluir o DDD.");
      return false;
    }
    if (!cliente.formaPagamento.forma) {
      alert("Selecione a forma de pagamento.");
      return false;
    }

    // Validação do troco
    if (cliente.formaPagamento.forma === "DINHEIRO" && checkTroco) {
      if (!cliente.formaPagamento.obsPagamento) {
        alert("Informe o valor em dinheiro que vai pagar para calcularmos o troco.");
        return false;
      }
      const troco = Number(cliente.formaPagamento.obsPagamento);
      if (troco < valorTotalPedido) {
        alert(
          `O valor para troco não pode ser menor que o valor total do pedido.\nTotal do pedido: R$ ${valorTotalPedido.toFixed(2)}`
        );
        return false;
      }
    }
    return true;
  };

  const validarAbaEntrega = () => {
    if (!checkRetirarLoja) {
      if (!endereco?.placeId) {
        alert("Selecione um endereço válido na busca por mapa.");
        return false;
      }
      if (!endereco?.numero) {
        alert("Informe o número do endereço.");
        return false;
      }
      // Validação caso a taxa retorne nula ou menor que zero por falha na API
      if (endereco.taxaEntrega === undefined || endereco.taxaEntrega === null || endereco.loading) {
        alert("Aguarde o cálculo da taxa de entrega ou tente selecionar o endereço novamente.");
        return false;
      }
    }
    return true;
  };

  // Centralizador de fluxo do botão principal
  const lidarComAvanco = () => {
    if (aba === 0) {
      if (validarAbaItens()) setAba(1);
    } else if (aba === 1) {
      if (validarAbaCliente()) setAba(2);
    } else if (aba === 2) {
      if (validarAbaEntrega()) finalizarPedido();
    }
  };

  async function finalizarPedido() {
    if (carregandoEnvio) return; // Impede cliques múltiplos assíncronos

    setCarregandoEnvio(true);
    pedidoFinalizadoRef.current = true;

    try {
      const pedido = {
        cliente: {
          ...cliente,
          telefone: telefoneLimpo,
          // Se for retirada na loja, podemos enviar o endereço zerado/nulo para o banco de dados
          endereco: checkRetirarLoja ? null : endereco
        },
        retirarNaLoja: checkRetirarLoja,
        itens: itens.map(item => ({ ...item })),
        total: valorTotalPedido,
        taxaEntrega: taxaEntregaEfetiva,
        status: "novo",
        impresso: false,
        criadoEm: new Date()
      };

      await criarPedido(idLoja, pedido);
      console.log("Pedido criado com sucesso:", pedido);

      limparCarrinho();
      clearEndereco();
      alert("Pedido realizado com sucesso!!");
      navigate(`/${idLoja}`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Houve um erro ao processar o seu pedido. Tente novamente.");
      pedidoFinalizadoRef.current = false;
    } finally {
      setCarregandoEnvio(false);
    }
  }

  useEffect(() => {
    if (itens.length === 0 && !pedidoFinalizadoRef.current) {
      alert("Seu carrinho foi esvaziado. Você será redirecionado para a loja.");
      navigate(`/${idLoja}`);
    }
  }, [itens, navigate, idLoja]);

  const getTextoBotao = () => {
    if (carregandoEnvio) return "Processando pedido...";
    if (aba === 0) return "Continuar para dados do cliente";
    if (aba === 1) return "Continuar para entrega";
    return "Finalizar pedido";
  };

  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (window.google?.maps?.places) {
      setMapsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapsLoaded(true));
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_GEO_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API Key não encontrada no .env");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=BR&language=pt-BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.body.appendChild(script);
  }, []);

  const formasPagamento = ["PIX", "DINHEIRO", "CARTÃO", "VALE REFEIÇÃO - VALE ALIMENTAÇÃO"];

  const handleBuscarEndereco = async (telefone) => {
    const telLimpo = limparTelefone(telefone);
    if (telLimpo.length === 11) {
      try {
        const enderecoEncontrado = await buscarUltimoEnderecoPorTelefone(idLoja, telLimpo);
        if (enderecoEncontrado) {
          setEndereco(enderecoEncontrado);
          alert("Endereço do seu último pedido carregado!");
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }
  };

  useEffect(() => {
    if (!checkTroco) {
      setCliente(prev => ({
        ...prev,
        formaPagamento: { ...prev.formaPagamento, obsPagamento: "" }
      }));
    }
  }, [checkTroco]);

  // Se mudar o valor da aba manualmente pelos cliques nas abas, bloqueia avanços inválidos
  const lidarComTrocaAba = (novaAba) => {
    if (novaAba === 1 && !validarAbaItens()) return;
    if (novaAba === 2 && (!validarAbaItens() || !validarAbaCliente())) return;
    setAba(novaAba);
  };

  const ready = mapsLoaded && enderecoLoja;

  if (!ready) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pt: 0, pb: 22 }}>
      <CarrinhoDrawer />

      <Tabs
        value={aba}
        onChange={(_, v) => lidarComTrocaAba(v)}
        variant="fullWidth"
      >
        <Tab label="Itens do carrinho" />
        <Tab label="Dados do cliente" />
        <Tab label="Dados para entrega" />
      </Tabs>

      {/* ABA 0: LISTA DE ITENS */}
      {aba === 0 && (
        <Card sx={{ my: 2 }}>
          <CardContent>
            {itens.length === 0 && (
              <Typography color="text.secondary">Seu carrinho está vazio</Typography>
            )}

            {itens.map((item) => (
              <Card key={item.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Avatar src={item.img} variant="rounded" sx={{ width: 64, height: 64 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight="bold">{item.nome}</Typography>
                    {item.descricao && (
                      <Typography variant="body2" color="text.secondary">{item.descricao}</Typography>
                    )}
                    {item.selecoes && Object.keys(item.selecoes).length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        {Object.entries(item.selecoes).map(([grupoId, grupo]) => (
                          <Typography key={grupoId} variant="caption" color="text.secondary" display="block">
                            <strong>{grupo.nome}:</strong> {grupo.itens.map(i => i.nome).join(", ")}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {item?.observacao && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Observação: {item.observacao}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton size="small" onClick={() => decrementar(item.id)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography fontWeight="bold">{item.quantidade ?? 1}</Typography>
                      <IconButton size="small" onClick={() => incrementar(item.id)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography fontWeight="bold">
                      R$ {(Number(item.valor ?? 0) * Number(item.quantidade ?? 1)).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}

            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight="bold">Total do carrinho</Typography>
              <Typography fontWeight="bold">R$ {valorTotalCarrinho.toFixed(2)}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ABA 1: DADOS DO CLIENTE */}
      {aba === 1 && (
        <Card sx={{ my: 2 }}>
          <CardContent>
            <TextField
              label="Nome"
              fullWidth
              size="small"
              sx={{ mb: 1 }}
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
            />

            <TextField
              label="Telefone"
              type="tel"
              fullWidth
              size="small"
              sx={{ mb: 1 }}
              value={cliente.telefone}
              error={cliente.telefone && !telefoneValido}
              helperText={cliente.telefone && !telefoneValido ? "Telefone inválido" : ""}
              onBlur={(e) => handleBuscarEndereco(e.target.value)}
              onChange={(e) => {
                const formatado = formatarTelefone(e.target.value);
                setCliente({ ...cliente, telefone: formatado });
              }}
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
                  formaPagamento: { ...cliente.formaPagamento, forma: e.target.value, obsPagamento: "" }
                })
              }
            >
              {formasPagamento.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>

            {cliente.formaPagamento.forma === "DINHEIRO" && (
              <>
                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Checkbox checked={checkTroco} onChange={(e) => setCheckTroco(e.target.checked)} />
                  }
                  label="Precisa de troco?"
                />
                {checkTroco && (
                  <TextField
                    label="Troco para quanto?"
                    fullWidth
                    type="number"
                    size="small"
                    value={cliente.formaPagamento.obsPagamento}
                    onChange={(e) =>
                      setCliente({
                        ...cliente,
                        formaPagamento: { ...cliente.formaPagamento, obsPagamento: e.target.value }
                      })
                    }
                  />
                )}
              </>
            )}

            {cliente.formaPagamento.forma === "PIX" && (
              <Typography sx={{ mt: 1 }} color="text.secondary">
                PIX será enviado após confirmação do pedido
              </Typography>
            )}

            {cliente.formaPagamento.forma === "VALE REFEIÇÃO - VALE ALIMENTAÇÃO" && (
              <Typography sx={{ mt: 1 }} color="text.secondary">
                Informe por favor o nome do VR/VA, ex: sodexo, alelo, etc... no campo de observação.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ABA 2: DADOS DA ENTREGA */}
      {aba === 2 && (
        <Card sx={{ my: 2 }}>
          <CardContent>
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox checked={checkRetirarLoja} onChange={(e) => setCheckRetirarLoja(e.target.checked)} />
              }
              label="Quero retirar na Loja."
            />

            <Card variant="outlined" sx={{ gridColumn: "1 / -1", my: 2, p: 2, bgcolor: "#f9f9f9" }}>
              <Typography fontWeight="bold">Endereço da Loja:</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{enderecoTexto}</Typography>
            </Card>

            {!checkRetirarLoja && <MapaEntrega />}
          </CardContent>
        </Card>
      )}

      {/* FOOTER FIXO */}
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
        <Card sx={{ mb: 1 }}>
          <CardContent sx={{ p: "8px 16px !important" }}>
            <Typography variant="body2" color="text.secondary">
              Valor do Carrinho: R$ {valorTotalCarrinho.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taxa de entrega: R$ {taxaEntregaEfetiva.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              Total do pedido: R$ {valorTotalPedido.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={carregandoEnvio || itens.length === 0}
          onClick={lidarComAvanco}
        >
          {getTextoBotao()}
        </Button>
      </Box>
    </Box>
  );
}