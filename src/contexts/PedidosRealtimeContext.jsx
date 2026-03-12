import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";

import { escutarPedidos, processarPedido } from "../services/pedidos.service";
import { tocarAudio } from "../services/audio.service";
import { useAdminRoute } from "../services/useAdminRoute";

import { usePreferencias } from "./PreferenciasContext";
import { useLoja } from "./LojaContext";

import campainha from "../assets/audios/campainha.mp3";

const PedidosRealtimeContext = createContext();

export function PedidosRealtimeProvider({ children }) {
    const [loading, setLoading] = useState(true);

    const isAdminRoute = useAdminRoute();
    const { preferencias } = usePreferencias();
    const { idLoja } = useLoja();

    const [pedidos, setPedidos] = useState([]);
    const [audioAtivo, setAudioAtivo] = useState(() => {
        return localStorage.getItem("audioPedidos") === "true";
    });

    const [autoAceitarPedidos, setAutoAceitarPedidos] = useState(() => {
        return localStorage.getItem("autoAceitarPedidos") === "true";
    });

    const autoRef = useRef(autoAceitarPedidos);

    useEffect(() => {
        autoRef.current = autoAceitarPedidos;
    }, [autoAceitarPedidos]);

    const toggleAutoAceitar = () => {
        const novo = !autoAceitarPedidos;
        setAutoAceitarPedidos(novo);
        localStorage.setItem("autoAceitarPedidos", novo);
    };

    const firstLoad = useRef(true);
    useEffect(() => {
        firstLoad.current = true;
    }, [idLoja]);

    const audioRef = useRef(audioAtivo);
    useEffect(() => {
        audioRef.current = audioAtivo;
    }, [audioAtivo]);

    useEffect(() => {
        if (!idLoja || !isAdminRoute) return;

        const unsub = escutarPedidos(idLoja, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {

                const pedido = { id: change.doc.id, ...change.doc.data() };

                if (
                    change.type === "added" &&
                    pedido.status === "pendente" &&
                    !firstLoad.current
                ) {

                    if (audioRef.current) {
                        tocarAudio(campainha);
                    }

                    if (autoRef.current && !pedido.impresso) {

                        await processarPedido({
                            idLoja,
                            pedido,
                            preferencias
                        });

                    }

                }

            });

            setLoading(false);
            firstLoad.current = false;
            setPedidos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [idLoja, isAdminRoute]);

    const pendentes = useMemo(() => {
        return pedidos.filter(p => p.status === "pendente").length;
    }, [pedidos]);


    const toggleAudio = () => {
        const novo = !audioAtivo;
        setAudioAtivo(novo);
        localStorage.setItem("audioPedidos", novo);
    };

    return (
        <PedidosRealtimeContext.Provider
            value={{
                loading,
                pedidos,
                pendentes,
                audioAtivo,
                toggleAudio,
                autoAceitarPedidos,
                toggleAutoAceitar
            }}
        >
            {children}
        </PedidosRealtimeContext.Provider>
    );
}

export const usePedidosRealtime = () => useContext(PedidosRealtimeContext);
