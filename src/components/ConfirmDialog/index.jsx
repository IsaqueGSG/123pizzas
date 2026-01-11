import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

export default function ConfirmDialog({
  open,
  onClose,
  title = "Confirmar ação",
  message,
  funcao
}) {
  const confirmar = async () => {
    if (funcao) {
      await funcao(); // 🔥 executa a função passada
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={confirmar}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
