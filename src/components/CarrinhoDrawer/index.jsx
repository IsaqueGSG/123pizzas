import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useNavigate, useLocation } from "react-router-dom";
import { useCarrinho } from "../../contexts/CarrinhoContext";
import { usePreferencias } from "../../contexts/PreferenciasContext";
import { abertoAgora } from "../../services/preferencias.service";
import { useEffect, useState } from "react";

import { useLoja } from "../../contexts/LojaContext";

const drawerWidth = 320;

export default function CarrinhoDrawer() {
  const { idLoja } = useLoja();

  const theme = useTheme();
  const navigate = useNavigate();

  const {
    openCarrinho,
    setOpenCarrinho,
    itens,
    total,
    incrementar,
    decrementar
  } = useCarrinho();

  const { preferencias, loading } = usePreferencias();

  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 30000); // mais responsivo

    return () => clearInterval(interval);
  }, []);

  const horarios = preferencias?.horarios;

  const aberto = !loading && horarios
    ? abertoAgora(horarios, agora)
    : false;

  const totalFormatado = Number(total || 0).toFixed(2);

  if (!openCarrinho) return null;

  return (
    <Drawer
      disableEnforceFocus
      disableRestoreFocus
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true
      }}
      variant="temporary"
      anchor="right"
      open={openCarrinho}
      onClose={() => setOpenCarrinho(false)}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          display: "flex",
          flexDirection: "column"
        }
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
        <IconButton onClick={() => setOpenCarrinho(false)}>
          <ChevronRightIcon />
        </IconButton>
        <Typography fontWeight="bold" sx={{ ml: 1 }}>
          Carrinho
        </Typography>
      </Box>

      <Divider />

      {/* ITENS */}
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {itens.length === 0 && (
          <Typography sx={{ p: 2 }} color="text.secondary">
            Carrinho vazio
          </Typography>
        )}

        {itens.map((item) => (
          <Box key={item.id} sx={{ p: 2, display: "flex", gap: 1 }}>
            <Avatar src={item.img} variant="rounded" />

            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight="bold">{item.nome}</Typography>
              <Typography variant="body2">
                R$ {(item.valor ?? 0).toFixed(2)}
              </Typography>

              {item.selecoes && Object.keys(item.selecoes).length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  {Object.entries(item.selecoes).map(([grupoId, grupo]) => (
                    <Typography key={grupoId} variant="body2" color="text.secondary">
                      <strong>{grupo.nome}:</strong> {grupo.itens.map(i => i.nome).join(", ")}
                    </Typography>
                  ))}
                </Box>
              )}

              {item?.observacao && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  observação: {
                    item.observacao
                  }
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" onClick={() => decrementar(item.id)}>
                <RemoveIcon />
              </IconButton>
              <Typography>{item.quantidade ?? 1}</Typography>

              <IconButton size="small" onClick={() => incrementar(item.id)}>
                <AddIcon />
              </IconButton>
            </Box>

          </Box>
        ))}
      </List>

      <Divider />

      {/* FOOTER */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Typography variant="h6">
          Total: R$ {totalFormatado}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1 }}
          disabled={itens.length === 0 || !aberto}
          onClick={() => {
            setOpenCarrinho(false)
            navigate(`/${idLoja}/checkout`)
          }}
        >
          {aberto ? "Finalizar Pedido" : "Estamos fechados"}
        </Button>

      </Box>
    </Drawer>
  );
}
