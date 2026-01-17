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
import { useEffect } from "react";

const drawerWidth = 320;

export default function CarrinhoDrawer() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    openCarrinho,
    setOpenCarrinho,
    itens,
    total,
    incrementar,
    decrementar
  } = useCarrinho();

  const { preferencias, loading } = usePreferencias();

  const aberto = !loading
    ? abertoAgora(preferencias.horarioFuncionamento)
    : false;


  const totalFormatado = Number(total || 0).toFixed(2);

  useEffect(() => {
    setOpenCarrinho(false);
  }, [location.pathname]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={openCarrinho}
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


              {item.extras?.obs && (
                <Typography variant="body2" color="text.secondary">
                  Obs: {item.extras.obs}
                </Typography>
              )}

              {item.extras?.borda && (
                <Typography variant="body2" color="text.secondary">
                  Borda: {item.extras.borda}
                </Typography>
              )}

              {item.extras?.adicionais?.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Extras:{" "}
                  {item.extras.adicionais.map((e) => e.nome).join(", ")}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" onClick={() => decrementar(item.id)}>
                <RemoveIcon />
              </IconButton>
              <Typography>{item.quantidade}</Typography>
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
          onClick={() => navigate("/checkout")}
        >
          { aberto ? "Finalizar Pedido" : "Estamos fechados"}
        </Button>
      </Box>
    </Drawer>
  );
}
