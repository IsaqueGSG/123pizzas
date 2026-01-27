import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Toolbar
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import {
  getPreferencias,
  salvarPreferencias
} from "../../services/preferencias.service";

import { useLoja } from "../../contexts/LojaContext";

const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo"
];

const DEFAULT_PREFS = {
  horarios: {
    segunda: { ativo: true, inicio: "18:00", fim: "23:00" },
    terca: { ativo: true, inicio: "18:00", fim: "23:00" },
    quarta: { ativo: true, inicio: "18:00", fim: "23:00" },
    quinta: { ativo: true, inicio: "18:00", fim: "23:00" },
    sexta: { ativo: true, inicio: "18:00", fim: "23:59" },
    sabado: { ativo: true, inicio: "18:00", fim: "23:59" },
    domingo: { ativo: false, inicio: "18:00", fim: "23:00" }
  },
  autoAceitar: false,
  impressora: {
    autoPrint: true,
    papel: "80mm"
  }
};

export default function AdminPreferencias() {
  const {idLoja} = useLoja()

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const data = await getPreferencias(idLoja);
      if (data) setPrefs({ ...DEFAULT_PREFS, ...data });
      setLoading(false);
    }
    carregar();
  }, [idLoja]);

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

  const salvar = async () => {
    setSalvando(true);
    await salvarPreferencias(idLoja, prefs);
    setSalvando(false);
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
    <Box sx={{ p: 2 }}>
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

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Card>

      {/* PEDIDOS */}
      {/* <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🤖 Pedidos
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={prefs.autoAceitar}
              onChange={(e) =>
                setPrefs((prev) => ({
                  ...prev,
                  autoAceitar: e.target.checked
                }))
              }
            />
          }
          label="Aceitar pedidos automaticamente"
        />
      </Card> */}

      {/* IMPRESSORA */}
      {/* <Card sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight="bold" gutterBottom>
          🖨️ Impressora
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={prefs.impressora.autoPrint}
              onChange={(e) =>
                setPrefs((prev) => ({
                  ...prev,
                  impressora: {
                    ...prev.impressora,
                    autoPrint: e.target.checked
                  }
                }))
              }
            />
          }
          label="Imprimir automaticamente"
        />

        <Box sx={{ mt: 2, width: 200 }}>
          <Typography variant="body2" gutterBottom>
            Tipo de papel
          </Typography>

          <Select
            size="small"
            fullWidth
            value={prefs.impressora.papel}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...prev,
                impressora: {
                  ...prev.impressora,
                  papel: e.target.value
                }
              }))
            }
          >
            <MenuItem value="58mm">58mm</MenuItem>
            <MenuItem value="80mm">80mm</MenuItem>
          </Select>
        </Box>
      </Card> */}

      <Button
        variant="contained"
        disabled={salvando}
        onClick={salvar}
      >
        {salvando ? "Salvando..." : "Salvar preferências"}
      </Button>
    </Box>
  );
}
