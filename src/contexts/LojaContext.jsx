import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLoja } from "../services/lojas.service";
import { useNavigate } from "react-router-dom";


const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [idLoja, setIdLojaState] = useState(null);
  const [ready, setReady] = useState(false);

  const [blocked, setBlocked] = useState(false);
  const [needsPaymentAction, setNeedsPaymentAction] = useState(false);

  const setIdLoja = async (lojaId) => {
    if (lojaId) {
      localStorage.setItem("idLoja", lojaId);
      setIdLojaState(lojaId);

      const data = await getLoja(lojaId);
      setLoja(data || null);

    } else {
      localStorage.removeItem("idLoja");
      setIdLojaState(null);
      setLoja(null);
    }
  };

  function isBlocked(assinatura) {
    return (
      assinatura?.statusPagamento === "atrasado" ||
      assinatura?.statusPagamento === "cancelado"
    );
  }

  function needsAction(assinatura) {
    return assinatura?.requiresAction === true;
  }

  // ⭐ resolver loja por prioridade
  useEffect(() => {
    async function resolverLoja() {
      const pathSegments = location.pathname.split("/");
      const firstSegment = pathSegments[1];

      const rotasGlobais = ["", "login"];

      // 🔒 Rotas globais → usar localStorage
      if (rotasGlobais.includes(firstSegment)) {
        const saved = localStorage.getItem("idLoja");

        if (saved) {
          const data = await getLoja(saved);

          if (data) {
            const assinatura = data.assinatura || {};

            setBlocked(isBlocked(assinatura));
            setNeedsPaymentAction(needsAction(assinatura));

            if (needsAction(assinatura)) {
              navigate("/registro-cobranca");
              setReady(true);
              return;
            }

            setLoja(data);
            setIdLojaState(data.idLoja);
          }
        }

        setReady(true);
        return;
      }

      // 🌐 URL define loja (modo web)
      const data = await getLoja(firstSegment);
      if (!data) {
        setReady(true);
        return;
      }

      const assinatura = data?.assinatura || {};
      const isAdminRoute = location.pathname.startsWith(`/${firstSegment}/admin`);
      const isCobrancaRoute = location.pathname.includes("registro-cobranca");

      setBlocked(isBlocked(assinatura));
      setNeedsPaymentAction(needsAction(assinatura));

      // 🔥 REDIRECIONA APENAS QUEM PRECISA FINALIZAR COBRANÇA
      if (
        needsAction(assinatura) &&
        isAdminRoute &&
        !isCobrancaRoute
      ) {
        alert("Finalize sua cobrança para continuar");

        localStorage.setItem("idLoja", data.idLoja);

        navigate("/registro-cobranca");

        setReady(true);
        return;
      }

      setLoja(data);
      setIdLojaState(data.idLoja);
      localStorage.setItem("idLoja", data.idLoja);

      setReady(true);
    }

    resolverLoja();
  }, [location.pathname]);

  if (!ready) return <div>Carregando...</div>;

  return (
    <LojaContext.Provider
      value={{
        loja,
        idLoja,
        setIdLoja,
        ready,
      }}
    >
      {children}
    </LojaContext.Provider>
  );
}

export const useLoja = () => useContext(LojaContext);