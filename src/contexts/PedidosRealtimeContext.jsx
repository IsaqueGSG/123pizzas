import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { escutarPedidos } from "../services/pedidos.service";
import { tocarAudio } from "../services/audio.service";
import campainha from "../assets/audios/campainha.mp3";
import { useLoja } from "./LojaContext";

import { useAdminRoute } from "../services/useAdminRoute";

const PedidosRealtimeContext = createContext();

export function PedidosRealtimeProvider({ children }) {
    const isAdminRoute = useAdminRoute();

    const { idLoja } = useLoja();
    const [pedidos, setPedidos] = useState([]);
    const [audioAtivo, setAudioAtivo] = useState(() => {
        return localStorage.getItem("audioPedidos") === "true";
    });

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
            snapshot.docChanges().forEach(change => {
                if (
                    change.type === "added" &&
                    change.doc.data().status === "pendente" &&
                    !firstLoad.current &&
                    audioRef.current // 🔥 não recria listener
                ) {
                    tocarAudio(campainha);
                }
            });

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
                pedidos,
                pendentes,
                audioAtivo,
                toggleAudio
            }}
        >
            {children}
        </PedidosRealtimeContext.Provider>
    );
}

export const usePedidosRealtime = () => useContext(PedidosRealtimeContext);
