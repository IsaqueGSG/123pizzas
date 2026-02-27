import { useLocation } from "react-router-dom";
import { useLoja } from "../contexts/LojaContext"

export function useAdminRoute() {
  const { pathname } = useLocation();
  const { idLoja } = useLoja();

  if (!idLoja) return false;

  return pathname.startsWith(`/${idLoja}/admin`);
}
