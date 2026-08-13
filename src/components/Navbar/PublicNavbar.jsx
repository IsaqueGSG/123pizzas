// src/components/PublicNavbar.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useLoja } from "../../contexts/LojaContext";

const AppBar = styled(MuiAppBar)({});

export default function PublicNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { idLoja, loja } = useLoja();
    const { quantidadeTotal, setOpenCarrinho } = useCarrinho();


    const path = location.pathname;
    const isPublicHome = path === `/${idLoja}`;
    const showStoreIcon = isPublicHome;
    const showBackButton = idLoja && !showStoreIcon;

    const handleBack = () => {
        if (!idLoja) {
            navigate(-1);
            return;
        }
        navigate(-1);
    };

    // Fecha o carrinho ao trocar de rota pública
    useEffect(() => {
        setOpenCarrinho(false);
    }, [location.pathname, setOpenCarrinho]);

    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    color="inherit"
                    onClick={showBackButton ? handleBack : () => navigate(`/${idLoja}`)}
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
                    onClick={showBackButton ? handleBack : () => navigate(`/${idLoja}`)}
                >
                    {loja?.nome || "Cardápio"}
                </Typography>

                <IconButton
                    color="inherit"
                    onClick={() => setOpenCarrinho(true)}
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
    );
}