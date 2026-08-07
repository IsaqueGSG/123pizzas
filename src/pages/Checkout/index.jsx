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
import { usePreferencias } from "../../contexts/PreferenciasContext"; // 🟢 Importado para pegar pagamentos dinâmicos

import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import MapaEntrega from "../../components/EnderecoEntega";

import { criarPedido, buscarUltimoEnderecoPorTelefone } from "../../services/pedidos.service";

export default function Checkout() {
  const { idLoja } = useLoja();
  const { preferencias } = usePreferencias(); // 🟢 Preferências da loja
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
  const [carregandoEndereco, setCarregandoEndereco] = useState(false);

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

  // Formas de pagamento ativas vindas do painel do admin
  const formasPagamentoAtivas = useMemo(() => {
    const pagamentosCfg = preferencias?.pagamentos || {};
    // Exemplo estruturado: { pix: { ativo: true, nome: "PIX" }, dinheiro: { ativo: true, nome: "Dinheiro" }, ... }
    // Ou se preferir um array simples salvo nas preferências, ajuste conforme sua modelagem.
    // Aqui assumimos um objeto onde filtramos os ativos:
    return Object.entries(pagamentosCfg)
      .filter(([_, config]) => config.ativo)
      .map(([key, config]) => config.nome || key.toUpperCase());
  }, [preferencias]);

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

  const validarAbaPagamento = () => {
    const novosErros = {};
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

  const lidarComAvanco = () => {
    setErrosForm({});
    if (aba === 0) {
      if (validarAbaItens()) setAba(1);
    } else if (aba === 1) {
      if (validarAbaCliente()) setAba(2);
    } else if (aba === 2) {
      if (validarAbaEntrega()) setAba(3);
    } else if (aba === 3) {
      if (validarAbaPagamento()) finalizarPedido();
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

  useEffect(() => {
    let ativo = true;

    const carregarHistoricoEndereco = async () => {
      if (telefoneLimpo.length === 11) {
        setCarregandoEndereco(true);
        try {
          const enderecoEncontrado = await buscarUltimoEnderecoPorTelefone(idLoja, telefoneLimpo);
          if (enderecoEncontrado && ativo) {
            setEndereco({
              ...enderecoEncontrado,
              loading: false,
              erro: ""
            });

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
    if (aba === 0) return "Continuar para dados";
    if (aba === 1) return "Continuar para entrega";
    if (aba === 2) return "Continuar para pagamento";
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
    if (novaAba === 3 && (!validarAbaItens() || !validarAbaCliente() || !validarAbaEntrega())) return;
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
    <Box sx={{ pt: 0, pb: 22 }}>
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
        <Tab label="Pagamento" />
      </Tabs>

      <Box sx={{ px: 2 }}>

        {/* ABA 0: ITENS */}
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

        {/* ABA 1: CLIENTE */}
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
            </CardContent>
          </Card>
        )}

        {/* ABA 2: ENTREGA */}
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

        {/* ABA 3: PAGAMENTO (Dinamizado) */}
        {/* ABA 3: PAGAMENTO (Dinamizado) */}
        {aba === 3 && (
          <Card sx={{ my: 2, borderRadius: 3 }}>
            <CardContent>
              <TextField
                label="Forma de pagamento"
                select
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                value={cliente.formaPagamento.forma}
                onChange={(e) => {
                  const selecionado = preferencias.pagamentos.find(p => p.nome === e.target.value);
                  setCliente({
                    ...cliente,
                    formaPagamento: {
                      ...cliente.formaPagamento,
                      forma: e.target.value,
                      obsExibicao: selecionado?.obs || ""
                    }
                  });
                }}
              >
                {preferencias?.pagamentos?.map((p) => (
                  <MenuItem key={p.nome} value={p.nome}>{p.nome}</MenuItem>
                ))}
              </TextField>

              {cliente.formaPagamento.obsExibicao && (
                <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{cliente.formaPagamento.obsExibicao}</Typography>
                </Card>
              )}

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
                      sx={{ mt: 1, mb: 2 }}
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

              {/* CARD RESUMO DO PEDIDO */}
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "action.hover",
                  mt: 2
                }}
              >
                {/* CABEÇALHO DO RESUMO */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {cliente.nome || "Nome do Cliente"} - {cliente.telefone || "Telefone"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {checkRetirarLoja ? (
                      "📍 Retirar na Loja"
                    ) : (
                      <>
                        📍 {endereco?.rua || "Rua não informada"}, {endereco?.numero || "S/N"} - {endereco?.bairro || ""}
                      </>
                    )}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* ITENS DO CARRINHO */}
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                  🍽️ ITENS DO PEDIDO
                </Typography>

                {itens.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.quantidade ?? 1}x {item.nome}
                    </Typography>
                    {item.observacao && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        • Obs: {item.observacao}
                      </Typography>
                    )}
                  </Box>
                ))}

                <Divider sx={{ my: 1.5 }} />

                {/* TOTAIS E PAGAMENTO */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="body2">
                    Subtotal: R$ {valorTotalCarrinho.toFixed(2)}
                  </Typography>
                  {!checkRetirarLoja && (
                    <Typography variant="body2">
                      Taxa de Entrega: R$ {taxaEntregaEfetiva.toFixed(2)}
                    </Typography>
                  )}
                  <Typography fontWeight="bold" sx={{ mt: 0.5 }}>
                    Total Geral: R$ {valorTotalPedido.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
                    Pagamento: {cliente.formaPagamento.forma || "Não selecionado"}
                    {checkTroco && cliente.formaPagamento.obsPagamento && ` (Troco para: R$ ${Number(cliente.formaPagamento.obsPagamento).toFixed(2)})`}
                  </Typography>
                </Box>
              </Card>

            </CardContent>
          </Card>
        )}

      </Box>

      {/* FOOTER FIXO */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0 -3px 12px rgba(0,0,0,0.12)",
          p: 1.5,
          zIndex: 1200,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Button
          variant="contained"
          size="medium"
          fullWidth
          disabled={carregandoEnvio || carregandoEndereco || itens.length === 0}
          onClick={lidarComAvanco}
          sx={{ py: 1, borderRadius: 2, fontWeight: "bold", textTransform: "none" }}
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