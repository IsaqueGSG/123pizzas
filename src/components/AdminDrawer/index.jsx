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

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 320;

export default function AdminDrawer() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, openAdminDrawer, setOpenAdminDrawer } = useAuth();

  // fecha o drawer ao trocar de rota
  useEffect(() => {
    setOpenAdminDrawer(false);
  }, [location.pathname, setOpenAdminDrawer]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={openAdminDrawer}
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
          <ListItemButton onClick={() => navigate("/addproduto")}>
            <AddIcon sx={{ mr: 2 }} />
            <ListItemText primary="Adicionar Produto" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/produtos")}>
            <AutoStoriesIcon sx={{ mr: 2 }} />
            <ListItemText primary="Gerenciar Produtos" />
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
