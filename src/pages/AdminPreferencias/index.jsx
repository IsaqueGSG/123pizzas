import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  CircularProgress,
  Toolbar,
  Select,
  MenuItem,
  IconButton,
  Alert
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import AdminZonasEntrega from "../../components/AdminZonasEntregas";

import { buscarCep, geocodeGoogle } from "../../services/entrega.service";
import { imprimir, geraComandaHTML } from "../../services/impressora.service";
import { usePreferencias } from "../../contexts/PreferenciasContext";

const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo"
];

export default function AdminPreferencias() {
  const { preferencias, atualizarPreferencias, loading } = usePreferencias();
  console.log("preferencias do contexto: ", preferencias);
  const [prefs, setPrefs] = useState(preferencias);

  const [cepLoja, setCepLoja] = useState("");
  const [cepData, setCepData] = useState(null);

  const [enderecoLoja, setEnderecoLoja] = useState("");
  const [numeroLoja, setNumeroLoja] = useState("");
  const [loadingEndereco, setLoadingEndereco] = useState(false);
  const [erroEndereco, setErroEndereco] = useState("");

  useEffect(() => {
    setPrefs(preferencias);

    if (preferencias?.enderecoLoja) {
      setCepLoja(preferencias.enderecoLoja.cep || "");
      setNumeroLoja(preferencias.enderecoLoja.numero || "");
    }
  }, [preferencias]);

  async function buscarEndereco() {
    try {
      if (!cepLoja || !numeroLoja) {
        setErroEndereco("Informe CEP e número");
        return;
      }

      setLoadingEndereco(true);
      setErroEndereco("");

      const cepData = await buscarCep(cepLoja);
      setCepData(cepData);

      const enderecoTexto = `${cepData.logradouro}, ${numeroLoja} - ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}, ${cepData.cep}`;
      setEnderecoLoja(enderecoTexto);

      const key = import.meta.env.VITE_GOOGLE_GEO_API_KEY;
      let geo;

      try {
        geo = await geocodeGoogle(key, enderecoTexto);
      } catch {
        geo = await geocodeGoogle(key, `${cepData.cep}, Brasil`);
      }

      const enderecoLoja = {
        enderecoCompleto: enderecoTexto,
        cep: cepData.cep,
        numero: numeroLoja,
        rua: cepData.logradouro,
        bairro: cepData.bairro,
        cidade: cepData.localidade,
        uf: cepData.uf,
        lat: geo.lat,
        lng: geo.lng
      };

      setPrefs(prev => ({
        ...prev,
        enderecoLoja
      }));

      setErroEndereco("");
    } catch (err) {
      setErroEndereco(err.message);
    } finally {
      setLoadingEndereco(false);
    }
  }

  const atualizarHorario = (dia, campo, valor) => {
    setPrefs(prev => ({
      ...prev,
      horarios: {
        ...(prev.horarios || {}),
        [dia]: {
          ...(prev.horarios?.[dia] || {}),
          [campo]: valor
        }
      }
    }));
  };

  const [printers, setPrinters] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [printerSalva, setPrinterSalva] = useState(null);

  useEffect(() => {
    async function load() {
      if (!window.electronAPI) return;

      const lista = await window.electronAPI.listPrinters();
      setPrinters(lista);

      const salva = await window.electronAPI.getPrinter();

      if (salva) {
        setSelecionada(salva);
        setPrinterSalva(salva);
      }

      const larguraLocal = await window.electronAPI.getLargura();

      setPrefs(prev => ({
        ...prev,
        impressao: {
          ...prev.impressao,
          largura: larguraLocal
        }
      }));
    }

    load();
  }, []);


  async function salvar() {
    if (!window.electronAPI) return;

    if (!selecionada?.shared || !selecionada?.shareName) {
      alert("⚠️ Essa impressora não está compartilhada no Windows.");
      return;
    }

    await window.electronAPI.setPrinter(selecionada);
    setPrinterSalva(selecionada);
  }

  const guardarPreferencias = async () => {
    await atualizarPreferencias(prefs);
    console.log("preferencias salvas: ", prefs);

    if (
      window.electronAPI &&
      JSON.stringify(selecionada) !== JSON.stringify(printerSalva)
    ) {
      await salvar();
      console.log("impressora salva: ", selecionada);
    }

    alert("Preferências salvas com sucesso!");
  };

  const houveMudanca = useMemo(() => {
    return (
      JSON.stringify(prefs) !== JSON.stringify(preferencias) ||
      (window.electronAPI && JSON.stringify(selecionada) !== JSON.stringify(printerSalva))
    );
  }, [prefs, preferencias, selecionada, printerSalva]);



  if (
    loading ||
    cepLoja === "" ||
    window.electronAPI && printers.length === 0
  ) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 8 }}>

      <AdminDrawer />

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Preferências
      </Typography>

      {/* HORÁRIOS */}
      {/* HORÁRIOS */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🕒 Horário de funcionamento
        </Typography>

        {DIAS_SEMANA.map(dia => {
          // 1. Criamos uma referência segura para os dados do dia
          const config = prefs?.horarios?.[dia] || { ativo: false, inicio: "00:00", fim: "00:00" };

          return (
            <Card key={dia} variant="outlined" sx={{ mb: 1.5, p: 1.5, bgcolor: config.ativo ? 'inherit' : '#f5f5f5' }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <FormControlLabel
                  sx={{ minWidth: 140 }}
                  control={
                    <Switch
                      checked={config.ativo}
                      onChange={e => atualizarHorario(dia, "ativo", e.target.checked)}
                    />
                  }
                  label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                />

                {config.ativo && (
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                      label="Início"
                      type="time"
                      size="small"
                      InputLabelProps={{ shrink: true }} // Garante que o label não suba no ícone
                      value={config.inicio || "00:00"}
                      onChange={e => atualizarHorario(dia, "inicio", e.target.value)}
                    />
                    <Typography variant="body2">até</Typography>
                    <TextField
                      label="Fim"
                      type="time"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={config.fim || "00:00"}
                      onChange={e => atualizarHorario(dia, "fim", e.target.value)}
                    />

                    {/* 2. Lógica visual para horários que viram a noite */}
                    {config.fim < config.inicio && config.fim !== "00:00" && (
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                        +1 dia
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          );
        })}
      </Card>

      {/* ENDEREÇO */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          📍 Endereço da loja
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            mt: 1
          }}
        >
          <TextField
            label="CEP"
            size="small"
            value={cepLoja}
            onChange={e => setCepLoja(e.target.value)}
          />

          <TextField
            label="Número"
            size="small"
            value={numeroLoja}
            onChange={e => setNumeroLoja(e.target.value)}
          />

          <Button
            variant="outlined"
            disabled={loadingEndereco || !cepLoja || !numeroLoja}
            onClick={buscarEndereco}
          >
            {loadingEndereco ? <CircularProgress size={20} /> : "Buscar"}
          </Button>

          {prefs.enderecoLoja?.lat && (
            <Card
              variant="outlined"
              sx={{ gridColumn: "1 / -1", mt: 2, p: 2, bgcolor: "#f9f9f9" }}
            >
              <Typography fontWeight="bold">
                Endereço confirmado
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {prefs.enderecoLoja.enderecoCompleto}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lat: {prefs.enderecoLoja.lat} | Lng:{" "}
                {prefs.enderecoLoja.lng}
              </Typography>
            </Card>
          )}

          {erroEndereco && (
            <Typography color="error">{erroEndereco}</Typography>
          )}
        </Box>
      </Card>

      {/* TAXA */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          💰 Taxa de entrega
        </Typography>

        <AdminZonasEntrega />

        <Typography sx={{ my: 2 }} fontWeight="bold" gutterBottom>
          Entrega por KM
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label="Taxa de entrega minima"
            type="number"
            size="small"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
            }}
            value={prefs.taxaEntregaMinima}
            onChange={e =>
              setPrefs(prev => ({
                ...prev,
                taxaEntregaMinima: Math.max(0, Number(e.target.value) || 0)
              }))
            }
          />

          <TextField
            fullWidth
            label="Valor por km"
            type="number"
            size="small"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
            }}
            value={prefs.taxaEntregaKm}
            onChange={e =>
              setPrefs(prev => ({
                ...prev,
                taxaEntregaKm: Math.max(0, Number(e.target.value) || 0)
              }))
            }
          />
        </Box>
      </Card>

      {/* IMPRESSÃO */}
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Configurações de impressão
          </Typography>

          <Button
            variant="contained"
            endIcon={<PrintIcon />}
            onClick={async () => {
              try {
                const now = Date.now();
                const seconds = Math.floor(now / 1000);
                const nanoseconds = (now % 1000) * 1e6;

                const pedido = {
                  id: "zYmtWFJiscslxVfsNtDZ",
                  impresso: true,
                  cliente: {
                    nome: "teste",
                    endereco: {
                      lat: -23.4624581,
                      observacao: "",
                      taxaEntrega: 216.28,
                      bairro: "Jardim Monte Alegre",
                      lng: -46.4174645,
                      loading: false,
                      cep: "07273270",
                      erro: "",
                      rua: "Rua Jopiata",
                      distanciaKm: 30.897,
                      cidade: "Guarulhos",
                      numero: "0",
                      uf: "SP"
                    },
                    telefone: "11111111111",
                    formaPagamento: {
                      obsPagamento: "",
                      forma: "PIX"
                    }
                  },
                  itens: [
                    {
                      valor: 20,
                      sabores: [],
                      observacao: "",
                      borda: null,
                      quantidade: 1,
                      extras: [],
                      nome: "Acai 700ml"
                    }
                  ],
                  createdAt: {
                    type: "firestore/timestamp/1.0",
                    seconds,
                    nanoseconds
                  },
                  total: 236.28
                };

                const larguraImpressao =
                  window.electronAPI
                    ? await window.electronAPI.getLargura()
                    : "80mm";

                if (!window.electronAPI) {
                  const html = geraComandaHTML(pedido, larguraImpressao);
                  imprimir(html);
                  return;
                }

                if (!selecionada) {
                  alert("⚠️ Nenhuma impressora selecionada.");
                  return;
                }

                if (!selecionada?.shareName) {
                  alert("⚠️ Impressora inválida ou não compartilhada.");
                  return;
                }

                const result =
                  await window.electronAPI.imprimirPedido(
                    pedido,
                    larguraImpressao,
                    null, // numero da comanda, não necessário para teste
                    selecionada
                  );

                if (!result?.success) {
                  alert(
                    "❌ Falha ao imprimir.\n\n" +
                    (result?.error || "Erro desconhecido.")
                  );
                  return;
                }

                alert("✅ Comanda enviada para impressora com sucesso.");

              } catch (error) {
                alert(
                  "❌ Erro ao tentar imprimir.\n\n" +
                  (error.message || error)
                );
              }
            }}
          >
            Testar impressão
          </Button>
        </Box>


        {/* largura papel */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
            mb: 2
          }}
        >
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            Largura do papel
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Ajusta o layout do cupom para a impressora térmica
          </Typography>

          <Select
            fullWidth
            size="small"
            value={prefs.impressao?.largura || "80mm"}
            onChange={async (e) => {
              const largura = e.target.value;

              // sempre atualizar UI
              setPrefs(prev => ({
                ...prev,
                impressao: {
                  ...prev.impressao,
                  largura
                }
              }));

              // salvar local no desktop
              if (window.electronAPI) {
                await window.electronAPI.setLargura(largura);
              }
            }}
          >
            <MenuItem value="58mm">58mm — cupom estreito</MenuItem>
            <MenuItem value="80mm">80mm — cupom padrão</MenuItem>
          </Select>
        </Box>

        {/* impressora */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50"
          }}
        >
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            Impressora automática
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Usada para impressão silenciosa de pedidos
          </Typography>

          <Select
            fullWidth
            size="small"
            disabled={!window.electronAPI}
            value={selecionada ? JSON.stringify(selecionada) : ""}
            onChange={(e) => {
              const printer = JSON.parse(e.target.value);
              setSelecionada(printer);
            }}
          >
            {window.electronAPI ? (
              printers.map(p => (
                <MenuItem key={p.name} value={JSON.stringify(p)}>
                  {p.displayName || p.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">
                Disponível apenas no Desktop
              </MenuItem>
            )}
          </Select>

          {!window.electronAPI && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mt: 1, display: "block" }}
            >
              ⚠️ Seleção de impressora só funciona na versão desktop
            </Typography>
          )}

          {selecionada && !selecionada.shared && (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                "& .MuiAlert-message": {
                  width: "100%"
                }
              }}
            >
              <Typography fontWeight="bold">
                Impressora não compartilhada
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                Para que a impressão automática funcione, compartilhe esta impressora no Windows.
              </Typography>

              <Typography variant="body2">
                1. Clique em <b>Configurar compartilhamento</b>
                <br />
                2. Abra a aba <b>Compartilhamento</b>
                <br />
                3. Marque <b>Compartilhar esta impressora</b>
                <br />
                4. Clique em <b>Aplicar</b> e <b>OK</b>
              </Typography>

              <Button
                sx={{ mt: 1.5 }}
                variant="contained"
                color="warning"
                onClick={() =>
                  window.electronAPI.openPrinterProperties(
                    selecionada.name
                  )
                }
              >
                Configurar compartilhamento
              </Button>
            </Alert>
          )}

        </Box>
      </Card >

      {/* SALVAR */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          p: 2,
          boxShadow: "0 -2px 10px rgba(0,0,0,.3)"
        }}
      >
        <Button
          fullWidth
          variant="contained"
          disabled={!houveMudanca}
          onClick={guardarPreferencias}
        >
          {
            !houveMudanca
              ? "Nenhuma alteração"
              : "Salvar preferências"}
        </Button>
      </Box>
    </Box >
  );
}
