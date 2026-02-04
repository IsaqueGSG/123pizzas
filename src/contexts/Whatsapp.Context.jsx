import { createContext, useContext, useEffect, useState } from "react";
import { useLoja } from "./LojaContext";

const WhatsContext = createContext();

export function WhatsProvider({ children }) {
  const { idLoja } = useLoja();
  const isDesktop = !!window.electronAPI;

  const [status, setStatus] = useState("idle");
  const [qr, setQr] = useState(null);

  useEffect(() => {
    if (!isDesktop || !idLoja) return;

    window.electronAPI.getWhatsStatus(idLoja)
      .then(s => {
        console.log(s)
        if (!s || s === "disconnected") {
          window.electronAPI.initWhats(idLoja);
          setStatus("starting");
        } else {
          setStatus(s);
        }
      });
  }, [idLoja, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const offQR = window.electronAPI.onWhatsQR((d) => {
      if (d.idLoja !== idLoja) return;
      setQr(d.qr);
      setStatus("qr");
    });

    const offStatus = window.electronAPI.onWhatsStatus((d) => {
      if (d.idLoja !== idLoja) return;
      setStatus(d.status);
      if (d.status === "ready") setQr(null);
    });

    return () => {
      offQR();
      offStatus();
    };
  }, [idLoja, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    window.electronAPI.onLogMessage((data) =>
      console.log(`[WHATS ${data.id}]`, ...data.msg));
  }, [])

  return (
    <WhatsContext.Provider value={{ status, qr }}>
      {children}
    </WhatsContext.Provider>
  );
}

export const useWhats = () => useContext(WhatsContext);
