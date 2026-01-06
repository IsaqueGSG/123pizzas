import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useNavigate } from "react-router-dom";


import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Avatar from "@mui/material/Avatar";


const drawerWidth = 320;

/* AppBar adaptado */
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginRight: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default function Carrinho() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const {
    itens,
    total,
    incrementar,
    decrementar,
    quantidadeTotal
  } = useCarrinho();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TOPO */}
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            123Pizzas
          </Typography>

          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setOpen(true)}
            sx={open ? { display: "none" } : {}}
          >
            <Badge
              badgeContent={quantidadeTotal}
              color="error"
              invisible={quantidadeTotal === 0}
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={open}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider />

        {/* ITENS */}
        <List sx={{ flexGrow: 1 }}>
          {itens.length === 0 && (
            <Typography sx={{ p: 2 }} color="text.secondary">
              Carrinho vazio
            </Typography>
          )}

          {itens.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                gap: 1
              }}
            >
              {/* IMAGEM */}
              <Avatar
                src={"https://images8.alphacoders.com/369/369063.jpg"} // substituir depois
                variant="rounded"
                sx={{ width: 56, height: 56 }}
              />

              {/* INFO */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight="bold" fontSize={14}>
                  {item.nome}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  R$ {item.preco.toFixed(2)}
                </Typography>
              </Box>

              {/* CONTROLES */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => decrementar(item.id)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography>{item.quantidade}</Typography>

                <IconButton
                  size="small"
                  onClick={() => incrementar(item.id)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </List>


        {/* TOTAL + CHECKOUT */}
        <Box sx={{ p: 2 }}>
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
    </Box>
  );
}
