import {
  Badge,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { usePedidosRealtime } from "../../contexts/PedidosRealtimeContext";
import { unlockAudio } from "../../services/audio.service";
import { useAdminRoute } from "../../services/useAdminRoute";

export default function BellPedidos() {
  const isAdminRoute = useAdminRoute();
  const { pendentes, audioAtivo, toggleAudio } = usePedidosRealtime();

  const [open, setOpen] = useState(false);

  // 🔥 Só verifica UMA vez por sessão
  useEffect(() => {
    if (!isAdminRoute) return;

    const unlocked = sessionStorage.getItem("audioUnlocked");
    const jaPerguntou = sessionStorage.getItem("audioDialogShown");

    // Só mostra UMA vez por sessão
    if (audioAtivo && !unlocked && !jaPerguntou) {
      setOpen(true);
      sessionStorage.setItem("audioDialogShown", "true");
    }
  }, [audioAtivo, isAdminRoute]);


  if (!isAdminRoute) return null;

  const handleEnableAudio = () => {
    // 🔊 Desbloqueia autoplay (ESSENCIAL)
    unlockAudio();

    // Marca sessão desbloqueada
    sessionStorage.setItem("audioUnlocked", "true");

    // Garante que o áudio está ativo no provider
    if (!audioAtivo) {
      toggleAudio();
    }

    setOpen(false);
  };

  const handleBellClick = () => {
    const unlocked = sessionStorage.getItem("audioUnlocked");

    // Se nunca desbloqueou, usa o clique do sino como interação válida
    if (!unlocked) {
      unlockAudio();
      sessionStorage.setItem("audioUnlocked", "true");
    }

    // Depois alterna o estado do áudio
    toggleAudio();
  };

  const tooltipText = useMemo(() => {
    if (pendentes.total === 0) {
      return "Nenhum pedido pendente";
    }

    const dias = Object.entries(pendentes.porDia)
      .sort((a, b) => b[0].localeCompare(a[0])) // mais recente primeiro
      .map(([dia, qtd]) => {
        const dataFormatada = new Date(dia).toLocaleDateString("pt-BR");
        return `${dataFormatada}: ${qtd}`;
      });

    return [
      `Total: ${pendentes.total}`,
      ...dias
    ].join("\n");
  }, [pendentes]);

  return (
    <>
      {/* 🔔 Dialog de primeira interação */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>🔊 Ativar som de novos pedidos</DialogTitle>

        <DialogContent>
          <Typography>
            Para ouvir o som quando chegar novos pedidos, precisamos de uma
            interação sua (exigência do navegador).
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Agora não
          </Button>

          <Button
            variant="contained"
            onClick={handleEnableAudio}
            autoFocus
          >
            Ativar som
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔔 Botão flutuante */}
      <Tooltip
        title={
          <span style={{ whiteSpace: "pre-line" }}>
            {tooltipText}
          </span>
        }
      >
        <Fab
          color={audioAtivo ? "primary" : "default"}
          onClick={handleBellClick} // 🔥 AGORA CORRETO
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 9999
          }}
        >
          <Badge badgeContent={pendentes.total} color="error">
            {audioAtivo ? <NotificationsIcon /> : <NotificationsOffIcon />}
          </Badge>
        </Fab>
      </Tooltip>
    </>
  );
}
