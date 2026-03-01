import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

export default function PrivateRoute({ children }) {
  const { user, role, loading } = useAuth();
  const { idLoja } = useLoja();

  if (loading || !idLoja) {
    return <div>Carregando...</div>;
  }

  if (!user || role !== "admin") {
    return <Navigate to={`/login`} replace />;
  }

  return children;

}