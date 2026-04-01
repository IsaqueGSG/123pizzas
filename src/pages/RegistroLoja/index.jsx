import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider
} from "@mui/material";

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .substring(0, 20);
}

export default function RegistroLoja() {
  useEffect(() => {
    localStorage.removeItem("idLoja");
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plano = searchParams.get("p") || "basico";

  const [nomeLoja, setNomeLoja] = useState("");
  const [slug, setSlug] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");

  const handleNomeLoja = (value) => {
    setNomeLoja(value);
    setSlug(gerarSlug(value));
  };

  const continuar = () => {
    if (nomeLoja.length < 3 || slug.length < 3) {
      setErro("Preencha corretamente");
      return;
    }

    const RESERVED = ["admin", "login", "registro", "api"];

    if (RESERVED.includes(slug)) {
      setErro("Este link não é permitido");
      return;
    }

    sessionStorage.setItem(
      "registroLoja",
      JSON.stringify({ nomeLoja, slug, telefone, plano })
    );

    navigate("/registro-cobranca");
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
          Criar sua loja
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
          label="Link da loja"
          value={slug}
          disabled
          helperText={`Seu link será: /${slug}`}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Telefone"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          margin="normal"
        />

        <Divider sx={{ my: 2 }} />

        {erro && (
          <Typography color="error" mb={1}>
            {erro}
          </Typography>
        )}

        <Button fullWidth variant="contained" onClick={continuar}>
          Continuar
        </Button>
      </Paper>
    </Box>
  );
}