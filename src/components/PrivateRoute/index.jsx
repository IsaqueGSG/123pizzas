import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { idLoja } = useLoja();

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to={`/${idLoja}/login`} replace />;
  }

  return children;
};

export default PrivateRoute;
