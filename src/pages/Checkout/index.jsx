import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// MUI - Imports Agrupados
import {
  Box, Typography, Card, CardContent, Divider, IconButton, Button,
  TextField, Avatar, FormControlLabel, Tab, Tabs, MenuItem,
  CircularProgress, Checkbox, FormHelperText
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

// Contextos e Serviços
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";
import { useEntrega } from "../../contexts/EntregaContext";
import { useCarrinho } from "../../contexts/CarrinhoContext";
import { usePreferencias } from "../../contexts/PreferenciasContext";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";
import MapaEntrega from "../../components/EnderecoEntega";
import { criarPedido, buscarUltimoEnderecoPorTelefone } from "../../services/pedidos.service";

export default function Checkout() {
  const navigate = useNavigate();
  const pedidoFinalizadoRef = useRef(false);

  // Contextos
  const { idLoja } = useLoja();
  const { preferencias } = usePreferencias();
  const { user, role } = useAuth();
  const { enderecoLoja, endereco, clearEndereco, setEndereco } = useEntrega();
  const { itens, incrementar, decrementar, limparCarrinho } = useCarrinho();

  const isAdmin = user && role === "admin"; // 🟢 Helper para facilitar checagens

  // Estados Locais
  const [aba, setAba] = useState(0);
  const [checkTroco, setCheckTroco] = useState(false);
  const [checkRetirarLoja, setCheckRetirarLoja] = useState(false);
  const [checkPago, setCheckPago] = useState(false);
  const [carregandoEnvio, setCarregandoEnvio] = useState(false);
  const [carregandoEndereco, setCarregandoEndereco] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [errosForm, setErrosForm] = useState({});

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    formaPagamento: { forma: "", obsPagamento: "" }
  });

  // Cálculos Financeiros
  const valorTotalCarrinho = itens.reduce((total, item) => total + Number(item.valor ?? 0) * Number(item.quantidade ?? 1), 0);
  const taxaEntregaEfetiva = checkRetirarLoja ? 0 : Number(endereco?.taxaEntrega ?? 0);
  const valorTotalPedido = valorTotalCarrinho + taxaEntregaEfetiva;

  // Helpers de Telefone
  const limparTelefone = (valor) => valor.replace(/\D/g, "");
  const telefoneLimpo = useMemo(() => limparTelefone(cliente.telefone), [cliente.telefone]);
  const telefoneValido = /^\d{10,11}$/.test(telefoneLimpo);

  const formatarTelefone = (valor) => {
    let num = valor.replace(/\D/g, "").slice(0, 11);
    if (!num) return "";
    if (num.length <= 2) return `(${num}`;
    if (num.length <= 6) return num.replace(/(\d{2})(\d+)/, "($1) $2");
    if (num.length <= 10) return num.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    return num.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
  };

  // 🟢 Validação Unificada
  const validarPasso = (passo) => {
    const erros = {};
    if (passo >= 1 && itens.length === 0) erros.carrinho = "Seu carrinho está vazio.";

    if (passo >= 2) {
      if (!cliente.nome.trim()) erros.nome = "Informe o nome do cliente.";
      if (!telefoneValido) erros.telefone = "Telefone inválido (com DDD).";
    }

    if (passo >= 3 && !checkRetirarLoja) {
      if (!endereco?.placeId || !endereco?.numero) erros.entrega = "Defina um endereço e número válidos.";
      if (endereco?.taxaEntrega == null || endereco?.loading) erros.entrega = "Aguarde a taxa de entrega.";
    }

    if (passo === 4) {
      if (!cliente.formaPagamento.forma) erros.formaPagamento = "Selecione a forma de pagamento.";
      if (cliente.formaPagamento.forma === "DINHEIRO" && checkTroco) {
        const troco = Number(cliente.formaPagamento.obsPagamento || 0);
        if (troco < valorTotalPedido) erros.obsPagamento = `Menor que o total (R$ ${valorTotalPedido.toFixed(2)})`;
      }
    }

    setErrosForm(erros);
    return Object.keys(erros).length === 0;
  };

  const lidarComAvanco = () => {
    if (validarPasso(aba + 1)) {
      if (aba < 3) setAba(aba + 1);
      else finalizarPedido();
    }
  };

  // 🟢 Finalizar Pedido refatorado para aceitar overrides (Facilita pro Admin)
  async function finalizarPedido(overrides = {}) {
    if (carregandoEnvio) return;
    setCarregandoEnvio(true);
    pedidoFinalizadoRef.current = true;

    // Se for admin e passar overrides, usamos eles em vez do state atual (evita o problema do setTimeout)
    const isRetirarNaLojaFinal = overrides.retirarNaLoja ?? checkRetirarLoja;
    const isPagoFinal = overrides.pago ?? checkPago;
    const nomeFinal = overrides.nome ?? cliente.nome;

    try {
      const pedido = {
        cliente: {
          ...cliente,
          nome: nomeFinal,
          telefone: overrides.telefone ?? telefoneLimpo,
          endereco: isRetirarNaLojaFinal ? null : endereco,
          formaPagamento: isPagoFinal ? { forma: "PAGO", obsPagamento: "" } : cliente.formaPagamento
        },
        retirarNaLoja: isRetirarNaLojaFinal,
        itens: itens.map(i => ({ ...i })),
        total: overrides.total ?? valorTotalPedido,
        taxaEntrega: isRetirarNaLojaFinal ? 0 : taxaEntregaEfetiva,
        status: isPagoFinal ? "preparando" : "pendente", // Admins já pulam etapa
        impresso: false,
        criadoEm: new Date()
      };

      await criarPedido(idLoja, pedido);
      limparCarrinho();
      clearEndereco();

      isAdmin ? window.close() : navigate(`/${idLoja}`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      pedidoFinalizadoRef.current = false;
    } finally {
      setCarregandoEnvio(false);
    }
  }

  // 🟢 Ação Rápida do Admin (PDV)
  const finalizarComoAdmin = () => {
    // Se o admin não preencheu nada, assumimos venda de balcão rápida
    const nomeRapido = cliente.nome.trim() ? cliente.nome : "Cliente Balcão";
    const telefoneRapido = telefoneLimpo || "00000000000";

    finalizarPedido({
      retirarNaLoja: true,
      pago: true,
      nome: nomeRapido,
      telefone: telefoneRapido,
      total: valorTotalCarrinho
    });
  };

  // Effects
  useEffect(() => {
    let ativo = true;
    if (telefoneLimpo.length === 11) {
      setCarregandoEndereco(true);
      buscarUltimoEnderecoPorTelefone(idLoja, telefoneLimpo)
        .then(res => {
          if (res && ativo) setEndereco({ ...res, loading: false, erro: "" });
        })
        .finally(() => ativo && setCarregandoEndereco(false));
    }
    return () => { ativo = false; };
  }, [telefoneLimpo, idLoja, setEndereco]);

  useEffect(() => {
    if (itens.length === 0 && !pedidoFinalizadoRef.current) navigate(`/${idLoja}`);
  }, [itens, navigate, idLoja]);

  useEffect(() => {
    if (!checkTroco) {
      setCliente(prev => ({ ...prev, formaPagamento: { ...prev.formaPagamento, obsPagamento: "" } }));
    }
  }, [checkTroco]);

  useEffect(() => {
    if (window.google?.maps?.places) return setMapsLoaded(true);
    const apiKey = import.meta.env.VITE_GOOGLE_GEO_API_KEY;
    if (!apiKey) return;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=BR&language=pt-BR`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    document.body.appendChild(script);
  }, []);

  const lidarComTrocaAba = (novaAba) => {
    if (isAdmin) return setAba(novaAba); // Admin navega livre
    if (validarPasso(novaAba)) setAba(novaAba); // Cliente trava se tiver erro
  };

  const getTextoBotao = () => {
    if (carregandoEnvio) return "Processando...";
    if (carregandoEndereco) return "Buscando endereço...";
    const textos = ["Continuar para dados", "Continuar para entrega", "Continuar para pagamento", "Finalizar pedido"];
    return textos[aba];
  };

  if (!mapsLoaded || !enderecoLoja) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 0, pb: 22 }}>
      <CarrinhoDrawer />

      <Tabs value={aba} onChange={(_, v) => lidarComTrocaAba(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
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
              {itens.length === 0 && <Typography color="text.secondary">Seu carrinho está vazio</Typography>}
              {itens.map((item) => (
                <Card key={item.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2 }} variant="outlined">
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar src={item.img} variant="rounded" sx={{ width: 64, height: 64 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">{item.nome}</Typography>
                      {item.descricao && <Typography variant="body2" color="text.secondary">{item.descricao}</Typography>}
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", bgcolor: "action.hover", borderRadius: 10, px: 0.5 }}>
                        <IconButton size="small" onClick={() => decrementar(item.id)}><RemoveIcon fontSize="small" /></IconButton>
                        <Typography fontWeight="bold" sx={{ mx: 1 }}>{item.quantidade ?? 1}</Typography>
                        <IconButton size="small" onClick={() => incrementar(item.id)}><AddIcon fontSize="small" /></IconButton>
                      </Box>
                      <Typography fontWeight="bold">R$ {(Number(item.valor ?? 0) * Number(item.quantidade ?? 1)).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight="bold">Total do carrinho</Typography>
                <Typography fontWeight="bold">R$ {valorTotalCarrinho.toFixed(2)}</Typography>
              </Box>
              {errosForm.carrinho && <FormHelperText error sx={{ mt: 1, textAlign: "center" }}>{errosForm.carrinho}</FormHelperText>}
            </CardContent>
          </Card>
        )}

        {/* ABA 1: CLIENTE */}
        {aba === 1 && (
          <Card sx={{ my: 2, borderRadius: 3, position: "relative" }}>
            <CardContent>
              <TextField label="Nome" fullWidth size="small" sx={{ mb: 2 }} value={cliente.nome} error={!!errosForm.nome} helperText={errosForm.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} />
              <TextField label="Telefone" type="tel" fullWidth size="small" value={cliente.telefone} error={!!errosForm.telefone} helperText={errosForm.telefone} onChange={(e) => setCliente({ ...cliente, telefone: formatarTelefone(e.target.value) })} />
            </CardContent>
          </Card>
        )}

        {/* ABA 2: ENTREGA */}
        {aba === 2 && (
          <Card sx={{ my: 2, borderRadius: 3 }}>
            <CardContent>
              <FormControlLabel control={<Checkbox checked={checkRetirarLoja} onChange={(e) => setCheckRetirarLoja(e.target.checked)} />} label="Quero retirar pessoalmente na Loja." />
              <Card variant="outlined" sx={{ my: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                <Typography fontWeight="bold" variant="body2">Endereço da Loja:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{`${enderecoLoja.rua}, ${enderecoLoja.numero} - ${enderecoLoja.bairro}`}</Typography>
              </Card>
              {!checkRetirarLoja && (
                <Box sx={{ mt: 1 }}>
                  {errosForm.entrega && <FormHelperText error sx={{ mb: 1, textAlign: "center" }}>{errosForm.entrega}</FormHelperText>}
                  <MapaEntrega />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* ABA 3: PAGAMENTO */}
        {aba === 3 && (
          <Card sx={{ my: 2, borderRadius: 3 }}>
            <CardContent>
              <TextField disabled={checkPago} label="Forma de pagamento" select fullWidth size="small" sx={{ mb: 2 }} value={cliente.formaPagamento.forma}
                onChange={(e) => {
                  const selecionado = preferencias?.pagamentos?.find(p => p.nome === e.target.value);
                  setCliente({ ...cliente, formaPagamento: { forma: e.target.value, obsExibicao: selecionado?.obs || "", obsPagamento: "" } });
                }}
                helperText={errosForm.formaPagamento} error={!!errosForm.formaPagamento}
              >

                {checkPago && <MenuItem value="PAGO">Pago</MenuItem>}

                <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                {preferencias?.pagamentos?.map((p) => <MenuItem key={p.id} value={p.nome}>{p.nome}</MenuItem>)}
              </TextField>

              {cliente.formaPagamento.obsExibicao && (
                <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}><Typography variant="body2">{cliente.formaPagamento.obsExibicao}</Typography></Card>
              )}

              {cliente.formaPagamento.forma === "DINHEIRO" && (
                <>
                  <FormControlLabel control={<Checkbox checked={checkTroco} onChange={(e) => setCheckTroco(e.target.checked)} />} label="Precisa de troco?" />
                  {checkTroco && (
                    <TextField label="Troco para quanto?" fullWidth type="number" size="small" sx={{ mt: 1, mb: 2 }} value={cliente.formaPagamento.obsPagamento} error={!!errosForm.obsPagamento} helperText={errosForm.obsPagamento} onChange={(e) => setCliente({ ...cliente, formaPagamento: { ...cliente.formaPagamento, obsPagamento: e.target.value } })} />
                  )}
                </>
              )}

              {isAdmin && (
                <FormControlLabel control={<Checkbox checked={checkPago} onChange={(e) => {
                  setCheckPago(e.target.checked);
                  setCliente(prev => ({ ...prev, formaPagamento: { ...prev.formaPagamento, forma: e.target.checked ? "PAGO" : "" } }));
                }} />} label="Marcar pedido como PAGO?" />
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
      <Box sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", bgcolor: "background.paper", boxShadow: "0 -3px 12px rgba(0,0,0,0.12)", p: 1.5, zIndex: 1200 }}>
        <Button variant="contained" size="medium" fullWidth disabled={carregandoEnvio || carregandoEndereco || itens.length === 0} onClick={lidarComAvanco} sx={{ py: 1, borderRadius: 2, fontWeight: "bold" }}>
          {carregandoEndereco ? <CircularProgress size={16} color="inherit" /> : getTextoBotao()}
        </Button>

        {isAdmin && (
          <Button variant="outlined" color="success" fullWidth sx={{ mt: 1, py: 1, borderRadius: 2, fontWeight: "bold" }} disabled={carregandoEnvio || itens.length === 0} onClick={finalizarComoAdmin}>
            Venda Rápida Balcão (ADM)
          </Button>
        )}
      </Box>
    </Box>
  );
}