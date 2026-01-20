import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const Login = () => {
  const { login, user, loading } = useAuth();

  const navigate = useNavigate();

  const { idLoja } = useLoja();

  useEffect(() => {
    if (user && !loading) {
      navigate(`/${idLoja}/produtos`, { replace: true });
    }
  }, [user, loading, idLoja, navigate]);


  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center"
      }}
    >
      <Button
        variant="contained"
        onClick={login}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Entrar com Google"}
      </Button>
    </div>
  );
};

export default Login;
