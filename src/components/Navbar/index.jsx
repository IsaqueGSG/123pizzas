import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from '@mui/icons-material/Store';
import MenuIcon from '@mui/icons-material/Menu';

import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const AppBar = styled(MuiAppBar)({});

export default function Navbar() {
    const { user, setOpenAdminDrawer } = useAuth();
    const { idLoja } = useLoja();

    const navigate = useNavigate();
    const location = useLocation();
    const { quantidadeTotal, setOpenCarrinho } = useCarrinho();

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

    const showBack = location.pathname !== `/${idLoja}`;

    const handleBack = () => {
        // window.history.length > 1 indica que existe página anterior
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(`/${idLoja}`, { replace: true });
        }
    };

    return (
        <AppBar position="fixed">
            <Toolbar>

                {showBack ? (
                    <IconButton color="inherit" onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                ) : (
                    <IconButton color="inherit">
                        <StoreIcon fontSize="large" />
                    </IconButton>
                )}

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate(`/${idLoja}`)}
                >
                    123Pedidos
                </Typography>

                {(user && isPrivateRoute) ? (
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
                )}

            </Toolbar>
        </AppBar>
    );
}
