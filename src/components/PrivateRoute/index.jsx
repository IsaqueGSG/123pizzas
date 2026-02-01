import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

export default function PrivateRoute({ children }) {
  const { user, role, loading } = useAuth();
  const { idLoja } = useLoja();

  if (loading) return <div>Carregando</div>;

  if (!user || role !== "admin") {
    return <Navigate to={`/${idLoja}/login`} replace />;
  }

  return children;
}
