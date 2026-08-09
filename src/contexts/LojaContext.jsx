import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoja } from "../services/lojas.service";

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [loja, setLoja] = useState(null);
    const [idLoja, setIdLojaState] = useState(null);
    const [ready, setReady] = useState(false);

    const [blocked, setBlocked] = useState(false);
    const [needsPaymentAction, setNeedsPaymentAction] = useState(false);

    const firstSegment = location.pathname.split("/")[1];

    // =========================================================
    // ALTERAR LOJA MANUALMENTE
    // =========================================================
    const setIdLoja = async (lojaId) => {
        if (lojaId) {
            localStorage.setItem("idLoja", lojaId);
            setIdLojaState(lojaId);

            const data = await getLoja(lojaId);

            if (data) {
                const assinatura = data.assinatura || {};

                setLoja(data);
                setBlocked(isBlocked(assinatura));
                setNeedsPaymentAction(needsAction(assinatura));
            } else {
                setLoja(null);
                setBlocked(false);
                setNeedsPaymentAction(false);
            }

        } else {
            localStorage.removeItem("idLoja");

            setIdLojaState(null);
            setLoja(null);
            setBlocked(false);
            setNeedsPaymentAction(false);
        }
    };

    // =========================================================
    // REGRAS DA ASSINATURA
    // =========================================================
    function isBlocked(assinatura) {
        return (
            assinatura?.statusPagamento === "atrasado" ||
            assinatura?.statusPagamento === "cancelado"
        );
    }

    function needsAction(assinatura) {
        return assinatura?.requiresAction === true;
    }

    // =========================================================
    // CARREGAR LOJA
    //
    // IMPORTANTE:
    // Este effect NÃO depende de location.pathname.
    // Depende somente do ID da loja.
    // =========================================================
    useEffect(() => {
        async function carregarLoja() {
            setReady(false);

            const rotasGlobais = [
                "",
                "login",
                "registro-saas",
                "registro-cobranca",
                "confirmar-criacao"
            ];

            let lojaId = firstSegment;

            // Rotas que não possuem /:idLoja
            if (rotasGlobais.includes(firstSegment)) {
                lojaId = localStorage.getItem("idLoja");
            }

            if (!lojaId) {
                setLoja(null);
                setIdLojaState(null);
                setBlocked(false);
                setNeedsPaymentAction(false);

                setReady(true);
                return;
            }

            console.log("🏪 Buscando loja:", lojaId);

            const data = await getLoja(lojaId);

            if (!data) {
                setLoja(null);
                setIdLojaState(null);
                setBlocked(false);
                setNeedsPaymentAction(false);

                setReady(true);
                return;
            }

            const assinatura = data.assinatura || {};

            setLoja(data);
            setIdLojaState(data.idLoja);

            setBlocked(isBlocked(assinatura));
            setNeedsPaymentAction(needsAction(assinatura));

            localStorage.setItem("idLoja", data.idLoja);

            setReady(true);
        }

        carregarLoja();

    }, [firstSegment]);


    // =========================================================
    // REGRAS DE NAVEGAÇÃO DA ASSINATURA
    //
    // Este effect pode rodar quando trocar de rota.
    // MAS NÃO FAZ getLoja().
    // Ele usa o estado "loja" que já temos.
    // =========================================================
    useEffect(() => {

        if (!loja) return;

        const assinatura = loja.assinatura || {};

        const precisaFinalizarCobranca =
            assinatura.requiresAction === true;

        const isAdminRoute =
            location.pathname.includes("/admin");

        const isCobrancaRoute =
            location.pathname === "/registro-cobranca";

        if (
            precisaFinalizarCobranca &&
            isAdminRoute &&
            !isCobrancaRoute
        ) {
            console.log(
                "⚠️ Usuário precisa finalizar cobrança"
            );

            navigate("/registro-cobranca", {
                replace: true
            });
        }

    }, [
        location.pathname,
        loja,
        navigate
    ]);


    // =========================================================
    // CONTEXT
    // =========================================================
    return (
        <LojaContext.Provider
            value={{
                loja,
                idLoja,
                setIdLoja,
                ready,
                blocked,
                needsPaymentAction,
            }}
        >
            {children}
        </LojaContext.Provider>
    );
}

export const useLoja = () => useContext(LojaContext);