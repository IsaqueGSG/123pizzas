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

      // ViaCEP
      const cepData = await buscarCep(cepLoja);
      setCepData(cepData);

      const enderecoTexto = `${cepData.logradouro}, ${numeroLoja} - ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}, ${cepData.cep}`;
      setEnderecoLoja(enderecoTexto);

      // Geocode
      const key = import.meta.env.VITE_GOOGLE_GEO_API_KEY;
      let geo = null;
      try {
        geo = await geocodeGoogle(key, enderecoTexto);
      } catch {
        geo = await geocodeGoogle(key, `${cepData.cep}, Brasil`);
      }

      const enderecoLoja = {
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

    } catch (err) {
      setErroEndereco(err.message);
    } finally {
      setLoadingEndereco(false);
    }
  }

  const atualizarHorario = (dia, campo, valor) => {
    setPrefs((prev) => ({
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

  const disabledSalvarPreferencias = () => {
    return JSON.stringify(prefs) === JSON.stringify(preferencias);
  };

  const guardarPreferencias = async () => {
    try {
      await atualizarPreferencias(prefs);
      console.log("Preferências salvas", prefs);
      alert("Preferências salvas com sucesso!");
    } catch (e) {
      alert("Erro ao salvar preferências. Tente novamente.");
      console.log("Erro ao salvar preferências", e);
    }
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

      {/* HORÁRIO */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🕒 Horário de funcionamento
        </Typography>

        {DIAS_SEMANA.map((dia) => (
          <Box key={dia} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.horarios[dia].ativo}
                  onChange={(e) =>
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
                  onChange={(e) =>
                    atualizarHorario(dia, "inicio", e.target.value)
                  }
                />
                <TextField
                  label="Fim"
                  type="time"
                  size="small"
                  value={prefs.horarios[dia].fim}
                  onChange={(e) =>
                    atualizarHorario(dia, "fim", e.target.value)
                  }
                />
              </Box>
            )}
          </Box>


        ))}
      </Card>

      {/* ENDEREÇO */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          📍 Endereço da loja
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mt: 1 }}>

          <TextField
            label="CEP"
            fullWidth
            size="small"
            value={cepLoja}
            onChange={e => setCepLoja(e.target.value)}
          />

          <TextField
            label="Número"
            fullWidth
            size="small"
            value={numeroLoja}
            onChange={e => setNumeroLoja(e.target.value)}
          />

          {/* Butao buca cep */}
          <Button
            disabled={
              loadingEndereco}
            variant="outlined"
            onClick={buscarEndereco}
          >
            {loadingEndereco ? (
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              "Buscar endereço"
            )}
          </Button>

          {(cepData && prefs.enderecoLoja.lat) && (
            <Box sx={{ gridColumn: "1 / -1", mt: 2 }}>
              <Typography>
                <strong>Endereço encontrado:</strong> {enderecoLoja} / {`Lat: ${prefs.enderecoLoja?.lat || ""}, Lng: ${prefs.enderecoLoja?.lng || ""} `}
              </Typography>
            </Box>
          )}

          {erroEndereco && (
            <Typography color="error" sx={{ mt: 1 }}>
              {erroEndereco}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Taxa de entrega */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          💰 Taxa de entrega por km
        </Typography>

        <TextField
          fullWidth
          label="Taxa por km (R$)"
          type="number"
          size="small"
          value={prefs.taxaEntregaKm}
          onChange={(e) => {
            //previne valor negativo
            if (e.target.value < 0) {
              e.target.value = 0;
            }
            const valor = Math.max(0, Number(e.target.value) || 0);

            setPrefs(prev => ({
              ...prev,
              taxaEntregaKm: valor
            }));

          }
          }
        />
      </Card >

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
          p: 2,
          zIndex: 1200,

          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Button
          fullWidth
          variant="contained"
          disabled={disabledSalvarPreferencias()}
          onClick={guardarPreferencias}
        >
          {disabledSalvarPreferencias()
            ? "Nenhuma alteração"
            : "Salvar preferências"}
        </Button>

      </Box>
    </Box >
  );
}
