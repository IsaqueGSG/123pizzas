import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .substring(0, 20);
}

export default function RegistroSaaS() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  // 🏪 Loja
  const [nomeLoja, setNomeLoja] = useState("");
  const [slug, setSlug] = useState("");
  const [telefone, setTelefone] = useState("");

  // 💳 Cobrança
  const [nomeCobranca, setNomeCobranca] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [emailCobranca, setEmailCobranca] = useState("");
  const [telefoneCobranca, setTelefoneCobranca] = useState("");

  const [erro, setErro] = useState("");

  const handleNomeLoja = (value) => {
    setNomeLoja(value);
    setSlug(gerarSlug(value));
  };

  // 🚀 Salva dados e pede login
  const continuar = async () => {
    setErro("");

    if (!nomeLoja || !slug || !cpfCnpj || !nomeCobranca) {
      setErro("Preencha os campos obrigatórios");
      return;
    }

    const dados = {
      loja: { nomeLoja, slug, telefone },
      cobranca: {
        nomeCobranca,
        cpfCnpj,
        emailCobranca,
        telefoneCobranca
      }
    };

    sessionStorage.setItem("registroSaaS", JSON.stringify(dados));
    sessionStorage.setItem("modoRegistro", "true");

    const result = await login();

    // 🔥 Se login ocorreu, navega
    if (result !== false) {
      navigate("/confirmar-criacao");
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
          Criar sua conta
        </Typography>

        <Typography variant="subtitle1">Dados da loja</Typography>

        <TextField
          fullWidth
          label="Nome da loja"
          value={nomeLoja}
          onChange={(e) => handleNomeLoja(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Endereço da loja"
          value={slug}
          onChange={(e) => setSlug(gerarSlug(e.target.value))}
          helperText={`Seu link será: /${slug}`}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          margin="normal"
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Dados para cobrança</Typography>

        <TextField
          fullWidth
          label="Nome / Razão social"
          value={nomeCobranca}
          onChange={(e) => setNomeCobranca(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="CPF ou CNPJ"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Email de cobrança"
          value={emailCobranca}
          onChange={(e) => setEmailCobranca(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Telefone de cobrança"
          value={telefoneCobranca}
          onChange={(e) => setTelefoneCobranca(e.target.value)}
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
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Continuar com Google"}
        </Button>

        <Typography mt={2} fontSize={14}>
          🎁 Teste grátis por 15 dias
        </Typography>
      </Paper>
    </Box>
  );
}