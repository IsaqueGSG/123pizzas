import { createContext, useContext, useEffect, useState } from "react";
import { useLoja } from "./LojaContext";

const WhatsContext = createContext();

const STATUS = {
  DISCONNECTED: "disconnected",
  READY: "ready",
  ERROR: "error"
};

export function WhatsProvider({ children }) {
  const { idLoja } = useLoja();
  const isDesktop = !!window.electronAPI;

  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [qr, setQr] = useState(null);
  const [numero, setNumero] = useState(null);

  // Inicialização única
  useEffect(() => {
    if (!isDesktop || !idLoja) return;
    window.electronAPI.initWhats(idLoja);
  }, [idLoja, isDesktop]);

  // Listeners de eventos
  useEffect(() => {
    if (!isDesktop || !idLoja) return;

    const offQR = window.electronAPI.onWhatsQR((d) => {
      if (d.idLoja !== idLoja) return;
      setQr(d.qr);
      setStatus(STATUS.DISCONNECTED);
    });

    const offStatus = window.electronAPI.onWhatsStatus((d) => {
      if (d.idLoja !== idLoja) return;
      setStatus(d.status);

      if (d.status === STATUS.READY) {
        setQr(null);
        setNumero(d.numero || null);
      } else {
        setNumero(null);
      }
    });

    return () => {
      offQR?.();
      offStatus?.();
    };
  }, [idLoja, isDesktop]);

  // Função de reset radical (Limpa tudo e reinicia)
  const resetWhats = async () => {
    if (!isDesktop || !idLoja) return;

    // 1. Estados visuais imediatos
    setQr(null);
    setStatus("reconnecting"); // Opcional: crie um status para mostrar que está processando

    // 2. Chama a função de reset no backend (que deleta a pasta e mata o socket)
    // Nota: Certifique-se de expor 'whats-reset' no seu preload/main
    try {
      await window.electronAPI.resetWhats(idLoja);
    } catch (error) {
      console.error("Erro ao resetar WhatsApp:", error);
      setStatus(STATUS.ERROR);
    }
  };

  const logoutWhats = async () => {
    if (!isDesktop || !idLoja) return;
    await window.electronAPI.logoutWhats(idLoja);
    setNumero(null);
    setQr(null);
    setStatus(STATUS.DISCONNECTED);
  };

  return (
    <WhatsContext.Provider
      value={{
        status,
        qr,
        isDesktop,
        restartWhats: resetWhats, // Redirecionando para a função de reset real
        logoutWhats,
        numero,
      }}
    >
      {children}
    </WhatsContext.Provider>
  );
}

export const useWhats = () => useContext(WhatsContext);