import {
  Button,
  CircularProgress,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";
import lojas from "../../services/IdLojas.services";

const Login = () => {
  const { login, user, role, loading } = useAuth();
  const { idLoja, setIdLoja } = useLoja();
  const navigate = useNavigate();

  // redirect após login
  useEffect(() => {
    if (user && role === "admin" && !loading && idLoja) {
      navigate(`/${idLoja}/admin/produtos`, { replace: true });
    }
  }, [user, role, loading, idLoja, navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
        p: 3,
        textAlign: "center",
        maxWidth: 400,
        margin: "0 auto"
      }}
    >
      {/* SELECT DA LOJA */}
      <FormControl fullWidth>
        <InputLabel>Selecione a loja</InputLabel>
        <Select
          value={idLoja || ""}
          label="Selecione a loja"
          onChange={(e) => setIdLoja(e.target.value)}
        >
          {lojas.map((loja) => (
            <MenuItem key={loja.idLoja} value={loja.idLoja}>
              {loja.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* BOTÃO LOGIN */}
      <Button
        variant="contained"
        onClick={login}
        disabled={loading || !idLoja}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Entrar com Google"}
      </Button>
    </Box>
  );
};

export default Login;