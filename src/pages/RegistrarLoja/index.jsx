import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";

import { db } from "../../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .substring(0, 20);
}

export default function RegistrarLoja() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nomeLoja, setNomeLoja] = useState("");
  const [telefone, setTelefone] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Faça login primeiro</Typography>
      </Box>
    );
  }

  const handleNomeChange = (value) => {
    setNomeLoja(value);
    setSlug(gerarSlug(value));
  };

  const criarLoja = async () => {
    setErro("");

    if (!nomeLoja) {
      setErro("Informe o nome da loja");
      return;
    }

    if (!slug) {
      setErro("Slug inválido");
      return;
    }

    setLoading(true);

    try {
      const lojaRef = doc(db, "clientes123pedidos", slug);

      // 🔎 verifica se já existe
      const snap = await getDoc(lojaRef);

      if (snap.exists()) {
        setErro("Já existe uma loja com esse endereço");
        setLoading(false);
        return;
      }

      // 🏆 cria loja (tenant)
      await setDoc(lojaRef, {
        nome: nomeLoja,
        telefone,
        ownerEmail: user.email,

        assinatura: {
          status: "trial",
          plano: "basico",
          trialEndsAt: Timestamp.fromDate(
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          )
        },

        createdAt: serverTimestamp()
      });

      // 👤 cria usuário admin
      const userRef = doc(
        db,
        "clientes123pedidos",
        slug,
        "usuarios",
        user.email.toLowerCase()
      );

      await setDoc(userRef, {
        role: "admin",
        createdAt: serverTimestamp()
      });

      // 🚀 redireciona para painel da loja
      navigate(`/${slug}/admin/pedidos`);

    } catch (err) {
      console.error(err);
      setErro("Erro ao criar loja");
    }

    setLoading(false);
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
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2}>
          Criar sua loja
        </Typography>

        <TextField
          fullWidth
          label="Nome da loja"
          value={nomeLoja}
          onChange={(e) => handleNomeChange(e.target.value)}
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
          label="Telefone (opcional)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
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
          onClick={criarLoja}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Criar loja"}
        </Button>

        <Typography mt={2} fontSize={14}>
          🎁 Teste grátis por 15 dias
        </Typography>
      </Paper>
    </Box>
  );
}