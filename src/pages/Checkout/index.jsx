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
import { Tab, Tabs, MenuItem, CircularProgress, Checkbox, FormHelperText } from "@mui/material";

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
  const {
    enderecoLoja,
    endereco,
    clearEndereco,
    setEndereco,
    calcularEntrega
  } = useEntrega();

  const [checkTroco, setCheckTroco] = useState(false);
  const [checkRetirarLoja, setCheckRetirarLoja] = useState(false);
  const [aba, setAba] = useState(0);
  const [carregandoEnvio, setCarregandoEnvio] = useState(false);
  const [carregandoEndereco, setCarregandoEndereco] = useState(false); // 🟢 UX: Loading de endereço

  // Estado para erros visuais no formulário (substituindo alerts)
  const [errosForm, setErrosForm] = useState({});

  const navigate = useNavigate();
  const pedidoFinalizadoRef = useRef(false);

  const {
    itens,
    incrementar,
    decrementar,
    limparCarrinho
  } = useCarrinho();

  const valorTotalCarrinho = itens.reduce(
    (total, item) => total + Number(item.valor ?? 0) * Number(item.quantidade ?? 1),
    0
  );

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

  // 🟢 UX: Validação refinada sem travar a tela com Alerts
  const validarAbaItens = () => {
    if (itens.length === 0) {
      setErrosForm(prev => ({ ...prev, carrinho: "Seu carrinho está vazio." }));
      return false;
    }
    setErrosForm(prev => ({ ...prev, carrinho: null }));
    return true;
  };

  const validarAbaCliente = () => {
    const novosErros = {};
    if (!cliente.nome.trim()) novosErros.nome = "Informe o nome do cliente.";
    if (!cliente.telefone) {
      novosErros.telefone = "Informe o telefone.";
    } else if (!telefoneValido) {
      novosErros.telefone = "Telefone inválido. Inclua o DDD (ex: 11999999999).";
    }
    if (!cliente.formaPagamento.forma) novosErros.formaPagamento = "Selecione a forma de pagamento.";

    if (cliente.formaPagamento.forma === "DINHEIRO" && checkTroco) {
      if (!cliente.formaPagamento.obsPagamento) {
        novosErros.obsPagamento = "Informe o valor para o troco.";
      } else {
        const troco = Number(cliente.formaPagamento.obsPagamento);
        if (troco < valorTotalPedido) {
          novosErros.obsPagamento = `Menor que o total (R$ ${valorTotalPedido.toFixed(2)})`;
        }
      }
    }

    setErrosForm(prev => ({ ...prev, ...novosErros }));
    return Object.keys(novosErros).length === 0;
  };

  const validarAbaEntrega = () => {
    if (!checkRetirarLoja) {
      if (!endereco?.placeId || !endereco?.numero) {
        setErrosForm(prev => ({ ...prev, entrega: "Por favor, defina um endereço e número válidos." }));
        return false;
      }
      if (endereco.taxaEntrega === undefined || endereco.taxaEntrega === null || endereco.loading) {
        setErrosForm(prev => ({ ...prev, entrega: "Aguarde a taxa de entrega ser calculada." }));
        return false;
      }
    }
    setErrosForm(prev => ({ ...prev, entrega: null }));
    return true;
  };

  const lidarComAvanco = () => {
    // Reseta erros locais da aba atual antes de testar
    setErrosForm({});
    if (aba === 0) {
      if (validarAbaItens()) setAba(1);
    } else if (aba === 1) {
      if (validarAbaCliente()) setAba(2);
    } else if (aba === 2) {
      if (validarAbaEntrega()) finalizarPedido();
    }
  };

  async function finalizarPedido() {
    if (carregandoEnvio) return;

    setCarregandoEnvio(true);
    pedidoFinalizadoRef.current = true;

    try {
      const pedido = {
        cliente: {
          ...cliente,
          telefone: telefoneLimpo,
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
      limparCarrinho();
      clearEndereco();
      navigate(`/${idLoja}`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      pedidoFinalizadoRef.current = false;
    } finally {
      setCarregandoEnvio(false);
    }
  }

  // 🟢 CORREÇÃO: Disparar busca e cálculo automático independente do método de entrada (Input manual ou Autofill)
  useEffect(() => {
    let ativo = true;

    const carregarHistoricoEndereco = async () => {
      if (telefoneLimpo.length === 11) {
        setCarregandoEndereco(true);
        try {
          const enderecoEncontrado = await buscarUltimoEnderecoPorTelefone(idLoja, telefoneLimpo);
          if (enderecoEncontrado && ativo) {
            // Define o endereço no context de forma síncrona
            setEndereco({
              ...enderecoEncontrado,
              loading: false,
              erro: ""
            });

            // 🔥 UX: Força o cálculo imediato da rota em segundo plano para agilizar
            setTimeout(() => {
              calcularEntrega();
            }, 100);
          }
        } catch (error) {
          console.error("Erro ao buscar histórico de endereço:", error);
        } finally {
          if (ativo) setCarregandoEndereco(false);
        }
      }
    };

    carregarHistoricoEndereco();

    return () => {
      ativo = false;
    };
  }, [telefoneLimpo, idLoja, setEndereco]);

  useEffect(() => {
    if (itens.length === 0 && !pedidoFinalizadoRef.current) {
      navigate(`/${idLoja}`);
    }
  }, [itens, navigate, idLoja]);

  const getTextoBotao = () => {
    if (carregandoEnvio) return "Processando pedido...";
    if (carregandoEndereco) return "Buscando seu endereço...";
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
    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=BR&language=pt-BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.body.appendChild(script);
  }, []);

  const formasPagamento = ["PIX", "DINHEIRO", "CARTÃO", "VALE REFEIÇÃO - VALE ALIMENTAÇÃO"];

  useEffect(() => {
    if (!checkTroco) {
      setCliente(prev => ({
        ...prev,
        formaPagamento: { ...prev.formaPagamento, obsPagamento: "" }
      }));
    }
  }, [checkTroco]);

  const lidarComTrocaAba = (novaAba) => {
    if (novaAba === 1 && !validarAbaItens()) return;
    if (novaAba === 2 && (!validarAbaItens() || !validarAbaCliente())) return;
    setAba(novaAba);
  };

  const enderecoTexto = enderecoLoja
    ? `${enderecoLoja.rua}, ${enderecoLoja.numero} - ${enderecoLoja.bairro} / ${enderecoLoja.cidade} - ${enderecoLoja.uf}`
    : "";

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
        sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
      >
        <Tab label="Itens" />
        <Tab label="Cliente" />
        <Tab label="Entrega" />
      </Tabs>

      {/* ABA 0: LISTA DE ITENS */}
      {aba === 0 && (
        <Card sx={{ my: 2, borderRadius: 3 }}>
          <CardContent>
            {itens.length === 0 && (
              <Typography color="text.secondary">Seu carrinho está vazio</Typography>
            )}

            {itens.map((item) => (
              <Card key={item.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2 }} variant="outlined">
                <Box sx={{ display: "flex", gap: 2 }}>
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
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                        Obs: {item.observacao}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: "action.hover", borderRadius: 10, px: 0.5 }}>
                      <IconButton size="small" onClick={() => decrementar(item.id)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography fontWeight="bold" sx={{ mx: 1 }}>{item.quantidade ?? 1}</Typography>
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

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight="bold">Total do carrinho</Typography>
              <Typography fontWeight="bold">R$ {valorTotalCarrinho.toFixed(2)}</Typography>
            </Box>
            {errosForm.carrinho && (
              <FormHelperText error sx={{ mt: 1, textAlign: "center" }}>{errosForm.carrinho}</FormHelperText>
            )}
          </CardContent>
        </Card>
      )}

      {/* ABA 1: DADOS DO CLIENTE */}
      {aba === 1 && (
        <Card sx={{ my: 2, borderRadius: 3, position: "relative" }}>
          <CardContent>
            {carregandoEndereco && (
              <Box sx={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                bgcolor: "rgba(255,255,255,0.7)", zIndex: 10,
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 1
              }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">Recuperando endereço do histórico...</Typography>
              </Box>
            )}

            <TextField
              label="Nome"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={cliente.nome}
              error={!!errosForm.nome}
              helperText={errosForm.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
            />

            <TextField
              label="Telefone"
              type="tel"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={cliente.telefone}
              error={!!errosForm.telefone}
              helperText={errosForm.telefone}
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
              sx={{ mb: 2 }}
              value={cliente.formaPagamento.forma}
              error={!!errosForm.formaPagamento}
              helperText={errosForm.formaPagamento}
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
                    sx={{ mt: 1 }}
                    value={cliente.formaPagamento.obsPagamento}
                    error={!!errosForm.obsPagamento}
                    helperText={errosForm.obsPagamento}
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
              <Typography variant="body2" sx={{ mt: 1 }} color="success.main">
                ✓ O código Copia e Cola do PIX será fornecido na finalização.
              </Typography>
            )}

            {cliente.formaPagamento.forma === "VALE REFEIÇÃO - VALE ALIMENTAÇÃO" && (
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                Por favor, informe a bandeira (ex: Sodexo, Alelo) nas observações de entrega.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ABA 2: DADOS DA ENTREGA */}
      {aba === 2 && (
        <Card sx={{ my: 2, borderRadius: 3 }}>
          <CardContent>
            <FormControlLabel
              control={
                <Checkbox checked={checkRetirarLoja} onChange={(e) => setCheckRetirarLoja(e.target.checked)} />
              }
              label="Quero retirar pessoalmente na Loja."
            />

            <Card variant="outlined" sx={{ my: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography fontWeight="bold" variant="body2">Endereço da Loja:</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{enderecoTexto}</Typography>
            </Card>

            {!checkRetirarLoja && (
              <Box sx={{ mt: 1 }}>
                <MapaEntrega />
                {errosForm.entrega && (
                  <FormHelperText error sx={{ mt: 1, fontSize: "0.85rem", textAlign: "center" }}>
                    {errosForm.entrega}
                  </FormHelperText>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* FOOTER FIXO SUPER COMPACTO */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0 -3px 12px rgba(0,0,0,0.12)",
          p: 1.5, // 🟢 Reduzido de 2 para 1.5 para salvar espaço
          zIndex: 1200,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Card sx={{ mb: 1, boxShadow: "none", bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
          <CardContent sx={{ p: "8px 12px !important" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
              <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                Subtotal:
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                R$ {valorTotalCarrinho.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
              <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                Taxa de entrega:
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                {checkRetirarLoja ? "Grátis (Retirada)" : `R$ ${taxaEntregaEfetiva.toFixed(2)}`}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" fontWeight="bold">Total a Pagar:</Typography> 
              <Typography variant="subtitle1" fontWeight="bold" color="primary"> 
                R$ {valorTotalPedido.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="medium" // 🟢 De "large" para "medium"
          fullWidth
          disabled={carregandoEnvio || carregandoEndereco || itens.length === 0}
          onClick={lidarComAvanco}
          sx={{ py: 1, borderRadius: 2, fontWeight: "bold", textTransform: "none" }} // 🟢 py reduzido de 1.5 para 1
        >
          {carregandoEndereco ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              <span>Buscando histórico...</span>
            </Box>
          ) : (
            getTextoBotao()
          )}
        </Button>
      </Box>
    </Box>
  );
}