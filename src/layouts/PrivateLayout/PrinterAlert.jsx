import { useEffect } from "react";

export default function PrinterAlert() {
  useEffect(() => {
    let cancelado = false;

    const esperarElectron = async () => {
      // ⭐ aguarda electronAPI existir
      let tentativas = 0;

      while (!window.electronAPI && tentativas < 20) {
        await new Promise(r => setTimeout(r, 150));
        tentativas++;
      }

      if (!window.electronAPI || cancelado) return;

      try {
        const nome = await window.electronAPI.getImpressoraSalva?.();
        const largura = await window.electronAPI.getLargura?.();

        if ((!nome || !largura) && !cancelado) {
          alert(
            "⚠️ Impressora não configurada.\n\n" +
            "Acesse Preferências e configure a impressão."
          );
        }
      } catch (err) {
        console.error("Erro ao verificar impressora:", err);
      }
    };

    esperarElectron();

    return () => {
      cancelado = true;
    };
  }, []);

  return null;
}