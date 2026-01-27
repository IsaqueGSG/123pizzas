import { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import SettingsIcon from "@mui/icons-material/Settings";
import RoomServiceIcon from '@mui/icons-material/RoomService';
import CategoryIcon from '@mui/icons-material/Category';

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const drawerWidth = 320;

export default function AdminDrawer() {
  const { idLoja } = useLoja();

  const theme = useTheme();
  const navigate = useNavigate();
  const { signOut, openAdminDrawer, setOpenAdminDrawer } = useAuth();

  return (
    openAdminDrawer &&
    <Drawer
      disableEnforceFocus
      disableRestoreFocus
      ModalProps={{
        keepMounted: false
      }}
      variant="temporary"
      anchor="right"
      open={openAdminDrawer}
      onClose={() => setOpenAdminDrawer(false)}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          display: "flex",
          flexDirection: "column"
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
        <IconButton onClick={() => setOpenAdminDrawer(false)}>
          <ChevronRightIcon />
        </IconButton>
        <Typography sx={{ ml: 1 }} fontWeight="bold">
          Administração
        </Typography>
      </Box>

      <Divider />

      {/* Navegação */}
      <List sx={{ flexGrow: 1 }}>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(`/${idLoja}/pedidos`, { replace: true })}>
            <RoomServiceIcon sx={{ mr: 2 }} />
            <ListItemText primary="Gerenciar Pedidos" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(`/${idLoja}/produtos`, { replace: true })}>
            <AutoStoriesIcon sx={{ mr: 2 }} />
            <ListItemText primary="Gerenciar Produtos" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(`/${idLoja}/categorias`, { replace: true })}>
            <CategoryIcon sx={{ mr: 2 }} />
            <ListItemText primary="Gerenciar Categorias" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(`/${idLoja}/preferencias`, { replace: true })}>
            <SettingsIcon sx={{ mr: 2 }} />
            <ListItemText primary="Ajustar Preferencias" />
          </ListItemButton>
        </ListItem>


      </List>

      <Divider />

      {/* Rodapé */}
      <Box
        sx={{
          p: 2,
          mt: "auto",
          borderTop: "1px solid",
          borderColor: "divider"
        }}
      >
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={signOut}
        >
          Sair
        </Button>
      </Box>
    </Drawer>
  );
}
