import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useLoja } from "../contexts/LojaContext"

export function useAdminRoute() {
  const location = useLocation();
  const { idLoja } = useLoja();

  const isAdminRoute = useMemo(() => {
    if (!idLoja) return false;

    const privatePrefixes = [
      `/${idLoja}/pedidos`,
      `/${idLoja}/produtos`,
      `/${idLoja}/addproduto`,
      `/${idLoja}/addcategoria`,
      `/${idLoja}/editproduto`,
      `/${idLoja}/preferencias`,
      `/${idLoja}/categorias`,
      `/${idLoja}/editcategoria`,
      `/${idLoja}/whatsapp`,
    ];

    return privatePrefixes.some(prefix =>
      location.pathname.startsWith(prefix)
    );
  }, [location.pathname, idLoja]);

  return isAdminRoute;
}
