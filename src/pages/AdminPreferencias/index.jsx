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
  IconButton
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
  const [selecionada, setSelecionada] = useState("");
  const [printerSalva, setPrinterSalva] = useState("");

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
    }

    load();
  }, []);


  async function salvar() {
    if (!window.electronAPI) return;
    await window.electronAPI.setPrinter(selecionada);
    setPrinterSalva(selecionada);
  }

  const guardarPreferencias = async () => {
    await atualizarPreferencias(prefs);
    console.log("preferencias salvas: ", prefs);

    if (window.electronAPI && selecionada !== printerSalva) {
      await salvar();
      console.log("impressora salva: ", selecionada);
    }

    alert("Preferências salvas com sucesso!");
  };

  const houveMudanca = useMemo(() => {
    return (
      JSON.stringify(prefs) !== JSON.stringify(preferencias) ||
      (window.electronAPI && selecionada !== printerSalva)
    );
  }, [prefs, preferencias, selecionada, printerSalva]);


  if (loading) {
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
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🕒 Horário de funcionamento
        </Typography>

        {DIAS_SEMANA.map(dia => (
          <Card key={dia} variant="outlined" sx={{ mb: 1.5, p: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.horarios?.[dia]?.ativo || false}
                  onChange={e =>
                    atualizarHorario(dia, "ativo", e.target.checked)
                  }
                />
              }
              label={dia.charAt(0).toUpperCase() + dia.slice(1)}
            />

            {prefs.horarios[dia].ativo && (
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  label="Início"
                  type="time"
                  size="small"
                  value={prefs.horarios[dia].inicio || ""}
                  onChange={e =>
                    atualizarHorario(dia, "inicio", e.target.value)
                  }
                />
                <TextField
                  label="Fim"
                  type="time"
                  size="small"
                  value={prefs.horarios[dia].fim || ""}
                  onChange={e =>
                    atualizarHorario(dia, "fim", e.target.value)
                  }
                />
              </Box>
            )}
          </Card>
        ))}
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

              const now = Date.now();
              const seconds = Math.floor(now / 1000);
              const nanoseconds = (now % 1000) * 1e6;

              const pedido = {
                "id": "zYmtWFJiscslxVfsNtDZ",
                "impresso": true,
                "cliente": {
                  "nome": "teste",
                  "endereco": {
                    "lat": -23.4624581,
                    "observacao": "",
                    "taxaEntrega": 216.28,
                    "bairro": "Jardim Monte Alegre",
                    "lng": -46.4174645,
                    "loading": false,
                    "cep": "07273270",
                    "erro": "",
                    "rua": "Rua Jopiata",
                    "distanciaKm": 30.897,
                    "cidade": "Guarulhos",
                    "numero": "0",
                    "uf": "SP"
                  },
                  "telefone": "11111111111",
                  "formaPagamento": {
                    "obsPagamento": "",
                    "forma": "PIX"
                  }
                },
                "itens": [
                  {
                    "valor": 20,
                    "sabores": [],
                    "observacao": "",
                    "borda": null,
                    "quantidade": 1,
                    "extras": [],
                    "img": "https://receitasabordochef.com.br/wp-content/uploads/2023/07/Como-Fazer-Acai.jpg",
                    "misto": false,
                    "id": "uoP0aTAt20BFqspuixdx||sem_borda|sem_obs",
                    "nome": "Acai 700ml"
                  }
                ],
                "status": "preparando",
                "createdAt": {
                  "type": "firestore/timestamp/1.0",
                  "seconds": seconds,
                  "nanoseconds": nanoseconds
                },
                "total": 236.28
              }
              const larguraImpressao = preferencias?.impressao?.largura || "80mm";
              if (!window.electronAPI) {
                const html = geraComandaHTML(pedido, larguraImpressao);
                imprimir(html);
              } else {
                console.log("impressao electron")
                const result = await window.electronAPI.imprimirPedido(pedido, larguraImpressao);
                console.log("RESULTADO IMPRESSÃO:", result);
              }

            }}>
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
            onChange={e =>
              setPrefs(prev => ({
                ...prev,
                impressao: {
                  ...prev.impressao,
                  largura: e.target.value
                }
              }))
            }
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
            value={selecionada || ""}
            onChange={(e) => setSelecionada(e.target.value)}
          >
            {window.electronAPI ? (
              printers.map(p => (
                <MenuItem key={p.name} value={p.name}>
                  {p.displayName || p.name}
                  {p.isDefault && " • padrão do sistema"}
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
        </Box>
      </Card >


      <Card sx={{ p: 2, mb: 3 }}>
        <a
          href="https://drive.google.com/drive/folders/1PXOp7L5Abd8xxwIOCp3WO7YDALkDEnaC?usp=sharing">
          Baixar versão desktop - https://drive.google.com/drive/folders/1PXOp7L5Abd8xxwIOCp3WO7YDALkDEnaC?usp=sharing
        </a>
      </Card>

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
