// src/components/PrivateNavbar.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import StoreIcon from "@mui/icons-material/Store";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useAuth } from "../../contexts/AuthContext";
import { useLoja } from "../../contexts/LojaContext";

const AppBar = styled(MuiAppBar)({});

export default function PrivateNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { idLoja, loja } = useLoja();
    const { setOpenAdminDrawer } = useAuth();

    const path = location.pathname;
    const isAdminHome = path === `/${idLoja}/admin/pedidos`;
    const showStoreIcon = isAdminHome;
    const showBackButton = idLoja && !showStoreIcon;

    const handleBack = () => {
        if (!idLoja) {
            navigate(-1);
            return;
        }

        // 🔐 ROTAS ADMIN ESPECÍFICAS
        if (path.startsWith(`/${idLoja}/admin`)) {
            if (path.includes("/addproduto") || path.includes("/editproduto")) {
                navigate(`/${idLoja}/admin/produtos`);
                return;
            }

            if (path.includes("/addcategoria") || path.includes("/editcategoria")) {
                navigate(`/${idLoja}/admin/categorias`);
                return;
            }

            navigate(`/${idLoja}/admin/pedidos`);
            return;
        }

        navigate(-1);
    };

    // Fecha o drawer do admin ao trocar de rota
    useEffect(() => {
        setOpenAdminDrawer(false);
    }, [location.pathname, setOpenAdminDrawer]);

    const getTitulo = () => {
        if (path.includes("/pedidos")) return `Pedidos | ${loja?.nome || ""}`;
        if (path.includes("/produtos")) return `Produtos | ${loja?.nome || ""}`;
        if (path.includes("/categorias")) return `Categorias | ${loja?.nome || ""}`;
        return `Admin | ${loja?.nome || ""}`;
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    color="inherit"
                    onClick={showBackButton ? handleBack : () => navigate(`/${idLoja}/admin/pedidos`)}
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
                    onClick={showBackButton ? handleBack : () => navigate(`/${idLoja}/admin/pedidos`)}
                >
                    {getTitulo()}
                </Typography>

                <IconButton
                    color="inherit"
                    onClick={() => setOpenAdminDrawer(true)}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}