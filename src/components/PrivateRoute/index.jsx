import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";
import { CircularProgress, Box } from "@mui/material";

export default function PrivateRoute({ children }) {
  const { user, role, loading } = useAuth();
  const { ready } = useLoja();

  if (loading || !ready) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // 1. Não está logado? Login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Está tentando acessar o admin de uma loja mas não tem cargo de admin nela?
  // Se o role for null ou diferente de admin, bloqueia.
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}