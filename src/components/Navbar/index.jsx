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

import { useCarrinho } from "../../contexts/CarrinhoContext";

const AppBar = styled(MuiAppBar)({});

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { quantidadeTotal, setOpen } = useCarrinho();

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
                    123Pizzas
                </Typography>

                <IconButton color="inherit" onClick={() => setOpen(true)}>
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
