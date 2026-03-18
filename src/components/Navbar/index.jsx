import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminRoute } from "../../services/useAdminRoute";
import { useLoja } from "../../contexts/LojaContext";

const AppBar = styled(MuiAppBar)({});

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { idLoja } = useLoja();

    const { user, setOpenAdminDrawer } = useAuth();
    const { quantidadeTotal, setOpenCarrinho } = useCarrinho();

    const isAdminRoute = useAdminRoute();

    const path = location.pathname;
    const isPublicHome = path === `/${idLoja}`;
    const isAdminHome = path === `/${idLoja}/admin/pedidos`;
    const isPrivateRoute = user && isAdminRoute;

    const showStoreIcon =
        (isAdminRoute && isAdminHome) || (!isAdminRoute && isPublicHome);

    const showBackButton = idLoja && !showStoreIcon;

    const handleBack = () => {
        if (!idLoja) {
            navigate(-1);
            return;
        }

        const path = location.pathname;

        // 🔐 ROTAS ADMIN ESPECÍFICAS
        if (path.startsWith(`/${idLoja}/admin`)) {

            // PRODUTOS
            if (
                path.includes("/addproduto") ||
                path.includes("/editproduto")
            ) {
                navigate(`/${idLoja}/admin/produtos`);
                return;
            }

            // CATEGORIAS
            if (
                path.includes("/addcategoria") ||
                path.includes("/editcategoria")
            ) {
                navigate(`/${idLoja}/admin/categorias`);
                return;
            }

            // 🔙 fallback admin → home admin
            navigate(`/${idLoja}/admin/pedidos`);
            return;
        }

        // 🌐 Rotas públicas
        navigate(-1);
    };

    // fecha o drawer ao trocar de rota
    useEffect(() => {
        setOpenAdminDrawer(false);
        setOpenCarrinho(false);
    }, [location.pathname, setOpenAdminDrawer, setOpenCarrinho]);

    return (
        <AppBar position="fixed">
            <Toolbar>

                <IconButton
                    color="inherit"
                    onClick={
                        showBackButton
                            ? handleBack
                            : () =>
                                navigate(
                                    isAdminRoute
                                        ? `/${idLoja}/admin/pedidos`
                                        : `/${idLoja}`
                                )
                    }
                >
                    {showBackButton ? (
                        <ArrowBackIcon fontSize="large" />
                    ) : (
                        <StoreIcon fontSize="large" />
                    )}
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={
                        showBackButton
                            ? handleBack
                            : () =>
                                navigate(
                                    isAdminRoute
                                        ? `/${idLoja}/admin/pedidos`
                                        : `/${idLoja}`
                                )
                    }
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
        </AppBar>
    );
}