import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === parseInt(cpf[10]);
}

function validarTelefone(tel) {
  tel = tel.replace(/\D/g, "");
  return tel.length >= 10 && tel.length <= 11;
}

export default function RegistroCobranca() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  //se nao tem registroLoja, volta pro passo 1
  useEffect(() => {
    const registroLoja = sessionStorage.getItem("registroLoja");
    if (!registroLoja) {
      navigate("/registro-saas");
    }
  }, [navigate]);


  const APIURL = import.meta.env.VITE_API_RENDER_ASAAS;

  const [nomeCobranca, setNomeCobranca] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [emailCobranca, setEmailCobranca] = useState("");
  const [telefoneCobranca, setTelefoneCobranca] = useState("");

  const [usarEmailGoogle, setUsarEmailGoogle] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const modoRetry = !!localStorage.getItem("idLoja");

  const emailFinal = usarEmailGoogle ? user?.email : emailCobranca;

  const cpfValido = cpfCnpj.length === 11 && validarCPF(cpfCnpj);
  const telefoneValido =
    !telefoneCobranca || validarTelefone(telefoneCobranca);

  const formValido =
    nomeCobranca.length >= 3 &&
    cpfValido &&
    telefoneValido &&
    (usarEmailGoogle ? !!user?.email : !!emailCobranca);

  const continuar = async () => {
    if (!formValido) {
      setErro("Preencha corretamente");
      return;
    }

    const cobranca = {
      nomeCobranca,
      cpfCnpj,
      emailCobranca: emailFinal,
      telefoneCobranca
    };

    sessionStorage.setItem("registroCobranca", JSON.stringify(cobranca));

    if (modoRetry) {
      await retryCobranca(cobranca);
    } else {
      await criarFluxo(cobranca);
    }
  };

  const retryCobranca = async (cobranca) => {
    try {
      setLoading(true);

      const token = await user.getIdToken();

      await axios.post(
        APIURL + "/retry-subscription",
        { cobranca, idLoja: localStorage.getItem("idLoja") },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/"); // ou dashboard
    } catch (err) {
      setErro("Erro ao reconfigurar cobrança");
    } finally {
      setLoading(false);
    }
  };

  const criarFluxo = async (cobranca) => {
    try {
      setLoading(true);

      const loja = JSON.parse(sessionStorage.getItem("registroLoja"));

      sessionStorage.setItem(
        "registroSaaS",
        JSON.stringify({
          loja,
          cobranca,
          plano: loja.plano
        })
      );

      sessionStorage.setItem("modoRegistro", "true");

      const result = await login();

      if (result !== false) {
        navigate("/confirmar-criacao");
      }

    } catch (err) {
      setErro("Erro ao continuar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" mb={2}>
          Dados de cobrança
        </Typography>

        <TextField
          fullWidth
          label="Nome / Razão social"
          value={nomeCobranca}
          onChange={(e) => setNomeCobranca(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="CPF"
          value={cpfCnpj.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
          )}
          onChange={(e) =>
            setCpfCnpj(e.target.value.replace(/\D/g, ""))
          }
          margin="normal"
        />

        <TextField
          disabled={usarEmailGoogle}
          fullWidth
          label="Email de cobrança"
          value={usarEmailGoogle ? (user?.email || "") : emailCobranca}
          onChange={(e) => setEmailCobranca(e.target.value)}
          margin="normal"
        />

        <FormControlLabel
          label="Usar email do Google"
          control={
            <Checkbox
              checked={usarEmailGoogle}
              onChange={(e) => {
                setUsarEmailGoogle(e.target.checked);
                if (e.target.checked) setEmailCobranca("");
              }}
            />
          }
        />

        <TextField
          fullWidth
          label="Telefone"
          value={telefoneCobranca}
          onChange={(e) =>
            setTelefoneCobranca(
              e.target.value.replace(/\D/g, "").slice(0, 11)
            )
          }
          margin="normal"
        />

        {erro && (
          <Typography color="error" mt={1}>
            {erro}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={continuar}
          disabled={loading || !formValido}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Continuar"}
        </Button>

        {!modoRetry && (
          <Typography mt={2} fontSize={14}>
            🎁 Teste grátis por 15 dias
          </Typography>
        )}
      </Paper>
    </Box>
  );
}