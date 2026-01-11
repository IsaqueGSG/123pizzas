import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import MenuIcon from '@mui/icons-material/Menu';

import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useAuth } from "../../contexts/AuthContext";

const AppBar = styled(MuiAppBar)({});

export default function Navbar() {
    const { user, setOpenAdminDrawer } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { quantidadeTotal, setOpenCarrinho } = useCarrinho();

    const privateRoutes = [
        "/produtos",
        "/addproduto",
        "/pedidos",
    ];


    const isPrivateRoute = privateRoutes.some(route =>
        location.pathname === route ||
        location.pathname.startsWith("/editproduto")
    );


    const showBack = location.pathname !== "/";

    return (
        <AppBar position="fixed">
            <Toolbar>
                {showBack ? (
                    <IconButton color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                ) : (
                    <IconButton color="inherit">
                        <LocalPizzaIcon />
                    </IconButton>
                )
                }

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    123Pedidos
                </Typography>

                {
                    (user && isPrivateRoute) ? (
                        <IconButton color="inherit" onClick={() => setOpenAdminDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <IconButton color="inherit" onClick={() => setOpenCarrinho(true)}>
                            <Badge
                                badgeContent={quantidadeTotal}
                                color="error"
                                invisible={quantidadeTotal === 0}
                            >
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                    )
                }

            </Toolbar>
        </AppBar >
    );
}

