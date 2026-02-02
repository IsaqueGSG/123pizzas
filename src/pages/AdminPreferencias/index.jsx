import { useEffect, useState } from "react";
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
  MenuItem
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { buscarCep, geocodeGoogle } from "../../services/entrega.service";
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

  const houveMudanca = JSON.stringify(prefs) !== JSON.stringify(preferencias)

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
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [campo]: valor
        }
      }
    }));
  };

  const guardarPreferencias = async () => {
    await atualizarPreferencias(prefs);
    alert("Preferências salvas com sucesso!");
  };


  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Navbar />
      <Toolbar />
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
                  checked={prefs.horarios[dia].ativo}
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
                  value={prefs.horarios[dia].inicio}
                  onChange={e =>
                    atualizarHorario(dia, "inicio", e.target.value)
                  }
                />
                <TextField
                  label="Fim"
                  type="time"
                  size="small"
                  value={prefs.horarios[dia].fim}
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
          💰 Taxa de entrega por km
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
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🖨️ Impressão da comanda
        </Typography>

        <Select
          fullWidth
          size="small"
          value={prefs.impressao.largura}
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
          <MenuItem value="58mm">58mm</MenuItem>
          <MenuItem value="80mm">80mm</MenuItem>
        </Select>
      </Card>

      <Card sx={{ p: 2, mb: 3 }}>
        <a href="https://drive.google.com/file/d/1aJ_a5ksPDj1mvd9ls1BTYI8kIKRZmlYi/view?usp=sharing">Baixar - https://drive.google.com/file/d/1aJ_a5ksPDj1mvd9ls1BTYI8kIKRZmlYi/view?usp=sharing</a>
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
    </Box>
  );
}
