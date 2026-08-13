// src/components/Navbar/PublicNavbar.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { styled } from "@mui/material/styles";

import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { useCarrinho } from "../../contexts/CarrinhoContext";
import { useLoja } from "../../contexts/LojaContext";
import { useProducts } from "../../contexts/ProdutosContext";

const AppBar = styled(MuiAppBar)({});

export default function PublicNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { idLoja, loja } = useLoja();

    const { quantidadeTotal, setOpenCarrinho } =
        useCarrinho();

    const { produtos } = useProducts();

    const [buscaAberta, setBuscaAberta] =
        useState(false);

    const [termoBusca, setTermoBusca] =
        useState("");

    const path = location.pathname;

    const isPublicHome =
        path === `/${idLoja}`;

    const showStoreIcon = isPublicHome;

    const showBackButton =
        idLoja && !showStoreIcon;


    // ============================================================
    // RESULTADOS DA BUSCA
    // ============================================================

    const resultadosBusca = useMemo(() => {

        const termo = termoBusca
            .trim()
            .toLowerCase();

        if (!termo) {
            return [];
        }

        return produtos
            .filter((produto) => {

                if (!produto.status) {
                    return false;
                }

                const nome =
                    produto.nome?.toLowerCase() || "";

                const categoria =
                    produto.categoria?.nome
                        ?.toLowerCase() || "";

                return (
                    nome.includes(termo) ||
                    categoria.includes(termo)
                );

            })
            .slice(0, 8);

    }, [produtos, termoBusca]);


    // ============================================================
    // NAVEGAÇÃO
    // ============================================================

    const handleBack = () => {
        if (!idLoja) {
            navigate(-1);
            return;
        }

        navigate(-1);
    };


    // ============================================================
    // BUSCA
    // ============================================================

    const abrirBusca = () => {
        setBuscaAberta(true);
    };


    const fecharBusca = () => {
        setBuscaAberta(false);
        setTermoBusca("");
    };


    const selecionarProduto = (produto) => {

        // Fecha a busca
        setBuscaAberta(false);
        setTermoBusca("");

        // Vai para o cardápio
        navigate(`/${idLoja}`, {
            state: {
                produtoId: produto.id,
                categoriaId: produto.categoriaId,
            },
        });
    };


    // ============================================================
    // FECHA CARRINHO AO TROCAR DE ROTA
    // ============================================================

    useEffect(() => {
        setOpenCarrinho(false);
    }, [
        location.pathname,
        setOpenCarrinho
    ]);


    // ============================================================
    // ESC
    // ============================================================

    useEffect(() => {

        if (!buscaAberta) return;

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {
                fecharBusca();
            }

        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [buscaAberta]);


    return (
        <>
            <AppBar position="fixed">

                <Toolbar>

                    {!buscaAberta ? (
                        <>
                            {/* Ícone loja / voltar */}
                            <IconButton
                                color="inherit"
                                onClick={
                                    showBackButton
                                        ? handleBack
                                        : () => navigate(`/${idLoja}`)
                                }
                            >
                                {showBackButton ? (
                                    <ArrowBackIcon fontSize="large" />
                                ) : (
                                    <StoreIcon fontSize="large" />
                                )}
                            </IconButton>

                            {/* Nome da loja */}
                            <Typography
                                variant="h6"
                                sx={{
                                    flexGrow: 1,
                                    cursor: "pointer",
                                }}
                                onClick={
                                    showBackButton
                                        ? handleBack
                                        : () => navigate(`/${idLoja}`)
                                }
                            >
                                {loja?.nome || "Cardápio"}
                            </Typography>

                            {/* Pesquisar */}
                            <IconButton
                                color="inherit"
                                onClick={abrirBusca}
                            >
                                <SearchIcon />
                            </IconButton>

                            {/* Carrinho */}
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
                        </>
                    ) : (
                        <>
                            {/* Input */}
                            <InputBase
                                autoFocus
                                value={termoBusca}
                                onChange={(event) =>
                                    setTermoBusca(event.target.value)
                                }
                                placeholder="Buscar produto..."
                                sx={{
                                    flexGrow: 1,
                                    ml: 1,
                                    color: "inherit",

                                    "& input": {
                                        fontSize: "1rem",
                                    },

                                    "& input::placeholder": {
                                        color: "inherit",
                                        opacity: 0.7,
                                    },
                                }}
                            />

                            {/* X */}
                            <IconButton
                                color="inherit"
                                onClick={fecharBusca}
                                edge="start"
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    )}

                </Toolbar>

            </AppBar>


            {/* ===================================================== */}
            {/* RESULTADOS DA BUSCA */}
            {/* ===================================================== */}

            {buscaAberta &&
                termoBusca.trim() && (

                    <Paper
                        elevation={8}
                        sx={{
                            position: "fixed",

                            top: {
                                xs: 56,
                                sm: 64,
                            },

                            left: 0,
                            right: 0,

                            zIndex: 1200,

                            maxHeight: "70vh",
                            overflowY: "auto",

                            borderRadius: 0,
                        }}
                    >

                        {resultadosBusca.length > 0 ? (

                            resultadosBusca.map(
                                (produto, index) => (

                                    <Box
                                        key={produto.id}
                                        onClick={() =>
                                            selecionarProduto(
                                                produto
                                            )
                                        }
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.5,
                                            borderBottom: "1px solid #eee",
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor:
                                                    "action.hover",
                                            },

                                        }}
                                    >

                                        {/* IMAGEM */}
                                        {produto.img ? (
                                            <Box
                                                component="img"
                                                src={produto.img}
                                                alt={produto.nome}
                                                sx={{
                                                    width: 55,
                                                    height: 55,
                                                    borderRadius: 2,
                                                    objectFit: "cover",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 55,
                                                    height: 55,
                                                    borderRadius: 2,
                                                    flexShrink: 0,

                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",

                                                    backgroundColor: "action.hover",
                                                }}
                                            >
                                                <RestaurantMenuIcon
                                                    sx={{
                                                        fontSize: 35,
                                                        color: "text.disabled",
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        {/* INFORMAÇÕES */}

                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                            }}
                                        >

                                            <Typography
                                                fontWeight={600}
                                                noWrap
                                            >
                                                {produto.nome}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                            >
                                                {
                                                    produto
                                                        .categoria
                                                        ?.nome
                                                }
                                            </Typography>

                                        </Box>


                                        {/* PREÇO */}

                                        <Typography
                                            fontWeight={600}
                                            sx={{
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            R${" "}
                                            {Number(
                                                produto.valor
                                            ).toFixed(2)}
                                        </Typography>

                                    </Box>

                                )
                            )

                        ) : (

                            <Box
                                sx={{
                                    p: 3,
                                    textAlign: "center",
                                }}
                            >

                                <Typography
                                    color="text.secondary"
                                >
                                    Nenhum produto encontrado.
                                </Typography>

                            </Box>

                        )}

                    </Paper >

                )
            }

        </>
    );
}