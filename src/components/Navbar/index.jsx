import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from '@mui/icons-material/Store';
import MenuIcon from '@mui/icons-material/Menu';

import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const AppBar = styled(MuiAppBar)({});

export default function Navbar() {
    const { user, setOpenAdminDrawer } = useAuth();
    const { quantidadeTotal, setOpenCarrinho } = useCarrinho();
    const { idLoja } = useLoja();

    const navigate = useNavigate();
    const location = useLocation();

    const privatePrefixes = [
        `/${idLoja}/produtos`,
        `/${idLoja}/addproduto`,
        `/${idLoja}/editproduto`,
        `/${idLoja}/pedidos`,
        `/${idLoja}/preferencias`,
    ];

    const isPrivateRoute = user && privatePrefixes.some(prefix =>
        location.pathname.startsWith(prefix)
    );

    // fecha o drawer ao trocar de rota
    useEffect(() => {
        setOpenAdminDrawer(false);
        setOpenCarrinho(false);
    }, [location.pathname, setOpenAdminDrawer, setOpenCarrinho]);



    return (
        <AppBar position="fixed">
            <Toolbar>

                <IconButton color="inherit">
                    <StoreIcon fontSize="large" />
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => isPrivateRoute ? navigate(`/${idLoja}/pedidos`) : navigate(`/${idLoja}`)}
                >
                    123Pedidos
                </Typography>

                {(user && isPrivateRoute) ? (
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            setOpenCarrinho(false);
                            setOpenAdminDrawer(true);
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            setOpenAdminDrawer(false);
                            setOpenCarrinho(true);
                        }}
                    >
                        <Badge
                            badgeContent={quantidadeTotal}
                            color="error"
                            invisible={quantidadeTotal === 0}
                        >
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>
                )}

            </Toolbar>
        </AppBar >
    );
}
