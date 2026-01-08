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

import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../../contexts/CarrinhoContext";

const drawerWidth = 320;

import { useLocation } from "react-router-dom";
import { useEffect } from "react";


export default function CarrinhoDrawer() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { open, setOpen, itens, total, incrementar, decrementar } = useCarrinho();

  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          display: "flex",
          flexDirection: "column" // 🔥 ESSENCIAL
        }
      }}
    >

      <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
        <IconButton onClick={() => setOpen(false)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Divider />

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
                R$ {item.preco.toFixed(2)}
              </Typography>

              {/* Borda */}
              {item.extras?.borda && (
                <Typography variant="body2" color="text.secondary">
                  Borda: {item.extras.borda}
                </Typography>
              )}

              {/* Extras */}
              {item.extras?.extras?.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Extras:{" "}
                  {item.extras.extras.map((e) => e.nome).join(", ")}
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

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          mt: "auto", // 🔥 EMPURRA PARA O FINAL
          backgroundColor: "background.paper"
        }}
      >
        <Typography variant="h6">
          Total: R$ {total.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 1 }}
          disabled={itens.length === 0}
          onClick={() => navigate("/checkout")}
        >
          Finalizar Pedido
        </Button>
      </Box>

    </Drawer>
  );
}
