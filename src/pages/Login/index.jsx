import { Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // rota de origem (se existir)
  const from = location.state?.from?.pathname || "/produtos";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

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
