import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  // iniciar sempre que abrir
  useEffect(() => {
    if (!isDesktop || !idLoja) return;

    window.electronAPI.initWhats(idLoja);
  }, [idLoja, isDesktop]);

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
      }
    });

    return () => {
      offQR?.();
      offStatus?.();
    };
  }, [idLoja, isDesktop]);

  const restartWhats = async () => {
    if (!isDesktop || !idLoja) return;

    setQr(null);
    setStatus(STATUS.DISCONNECTED);

    await window.electronAPI.initWhats(idLoja);
  };

  return (
    <WhatsContext.Provider
      value={{
        status,
        qr,
        isDesktop,
        restartWhats
      }}
    >
      {children}
    </WhatsContext.Provider>
  );
}

export const useWhats = () => useContext(WhatsContext);
