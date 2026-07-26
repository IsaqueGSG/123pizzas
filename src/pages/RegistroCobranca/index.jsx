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

// Validação mínima de email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validação mínima de telefone (10 a 11 dígitos)
function validarTelefone(tel) {
  const apenasNumeros = tel.replace(/\D/g, "");
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
}

export default function RegistroCobranca() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const APIURL = import.meta.env.VITE_API_RENDER_ASAAS;

  const [nomeCobranca, setNomeCobranca] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [emailCobranca, setEmailCobranca] = useState("");
  const [telefoneCobranca, setTelefoneCobranca] = useState("");

  const [usarEmailGoogle, setUsarEmailGoogle] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const modoRetry = !!localStorage.getItem("idLoja") && !sessionStorage.getItem("registroLoja");

  const emailFinal = usarEmailGoogle ? (user?.email || "") : emailCobranca;

  // Regras de validação individuais para cada campo
  const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, "");
  const cpfCnpjValido = cpfCnpjLimpo.length >= 11; // Aceita CPF (11) ou CNPJ (14)
  const nomeValido = nomeCobranca.trim().length >= 3;
  const emailValido = validarEmail(emailFinal);
  const telefoneValido = !telefoneCobranca || validarTelefone(telefoneCobranca);

  // Formulário só é válido se todos passarem pelas regras
  const formValido =
    nomeValido &&
    cpfCnpjValido &&
    emailValido &&
    telefoneValido;

  const continuar = async () => {
    if (!formValido) {
      setErro("Preencha todos os campos corretamente.");
      return;
    }

    setErro(""); // Limpa erro anterior se houver

    const cobranca = {
      nomeCobranca: nomeCobranca.trim(),
      cpfCnpj: cpfCnpjLimpo,
      emailCobranca: emailFinal,
      telefoneCobranca: telefoneCobranca.replace(/\D/g, "")
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

      if (!user) {
        setErro("Usuário não autenticado");
        return;
      }

      const token = await user.getIdToken();
      const idLoja = localStorage.getItem("idLoja");

      await axios.post(
        APIURL + "/retry-subscription",
        { cobranca, idLoja },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/${idLoja}/admin/pedidos`);
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

  useEffect(() => {
    const saved = sessionStorage.getItem("registroCobranca");

    if (saved) {
      const data = JSON.parse(saved);
      setNomeCobranca(data.nomeCobranca || "");
      setCpfCnpj(data.cpfCnpj || "");
      setEmailCobranca(data.emailCobranca || "");
      setTelefoneCobranca(data.telefoneCobranca || "");
    }
  }, []);

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const isNovoFluxo = !!sessionStorage.getItem("registroLoja");
    const isRetry = !!localStorage.getItem("idLoja");

    if (!isNovoFluxo && !isRetry) {
      navigate("/registro-saas");
      return;
    }

    setChecked(true);
  }, [navigate]);

  if (!checked) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          error={nomeCobranca.length > 0 && !nomeValido}
          helperText={nomeCobranca.length > 0 && !nomeValido ? "Mínimo de 3 caracteres" : ""}
        />

        <TextField
          fullWidth
          label="CPF ou CNPJ"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
          inputProps={{ maxLength: 18 }}
          margin="normal"
          error={cpfCnpj.length > 0 && !cpfCnpjValido}
          helperText={cpfCnpj.length > 0 && !cpfCnpjValido ? "Informe um CPF ou CNPJ válido" : ""}
        />

        <TextField
          disabled={usarEmailGoogle}
          fullWidth
          label="Email de cobrança"
          value={usarEmailGoogle ? (user?.email || "") : emailCobranca}
          onChange={(e) => setEmailCobranca(e.target.value)}
          margin="normal"
          error={emailFinal.length > 0 && !emailValido}
          helperText={emailFinal.length > 0 && !emailValido ? "E-mail inválido" : ""}
        />

        <TextField
          fullWidth
          label="Telefone (Opcional)"
          value={telefoneCobranca}
          onChange={(e) =>
            setTelefoneCobranca(
              e.target.value.replace(/\D/g, "").slice(0, 11)
            )
          }
          margin="normal"
          error={telefoneCobranca.length > 0 && !telefoneValido}
          helperText={telefoneCobranca.length > 0 && !telefoneValido ? "Telefone incompleto (DDD + número)" : ""}
        />

        {erro && (
          <Typography color="error" mt={1}>
            {erro}
          </Typography>
        )}

        <Typography mt={2} fontSize={14}>
          🎁 Você receberá 15 dias grátis
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={continuar}
          disabled={loading || !formValido}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Continuar"}
        </Button>
      </Paper>
    </Box>
  );
}