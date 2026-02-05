import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLoja } from "./LojaContext";

const WhatsContext = createContext();

const STATUS = {
  IDLE: "idle",
  PREPARING: "preparando",
  STARTING: "starting",
  QR: "qr",
  READY: "ready",
  AUTH: "authenticated",
  DISCONNECTED: "disconnected",
  ERROR: "error"
};

export function WhatsProvider({ children }) {
  const { idLoja } = useLoja();
  const isDesktop = !!window.electronAPI;

  const [status, setStatus] = useState(STATUS.IDLE);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------
  const init = useCallback(async () => {
    if (!isDesktop || !idLoja) return;

    try {
      setLoading(true);
      setStatus(STATUS.PREPARING);

      const s = await window.electronAPI.getWhatsStatus(idLoja);

      if (!s || s === STATUS.DISCONNECTED) {
        await window.electronAPI.initWhats(idLoja);
        setStatus(STATUS.STARTING);
      } else {
        setStatus(s);
      }
    } catch (e) {
      console.error(e);
      setStatus(STATUS.ERROR);
    } finally {
      setLoading(false);
    }
  }, [idLoja, isDesktop]);

  // -------------------------
  useEffect(() => {
    init();
  }, [init]);

  // -------------------------
  useEffect(() => {
    if (!isDesktop || !idLoja) return;

    const offQR = window.electronAPI.onWhatsQR((d) => {
      if (d.idLoja !== idLoja) return;
      setQr(d.qr);
      setStatus(STATUS.QR);
    });

    const offStatus = window.electronAPI.onWhatsStatus((d) => {
      if (d.idLoja !== idLoja) return;
      setStatus(d.status);
      if (d.status === STATUS.READY) setQr(null);
    });

    return () => {
      offQR?.();
      offStatus?.();
    };
  }, [idLoja, isDesktop]);

  // -------------------------
  useEffect(() => {
    if (!isDesktop) return;

    const off = window.electronAPI.onLogMessage((data) =>
      console.log(`[WHATS ${data.id}]`, ...data.msg)
    );

    return () => off?.();
  }, [isDesktop]);

  // -------------------------
  const restartWhats = () => {
    if (!isDesktop || !idLoja) return;
    window.electronAPI.initWhats(idLoja);
    setStatus(STATUS.STARTING);
  };

  return (
    <WhatsContext.Provider
      value={{
        status,
        qr,
        loading,
        isDesktop,
        restartWhats
      }}
    >
      {children}
    </WhatsContext.Provider>
  );
}

export const useWhats = () => useContext(WhatsContext);
