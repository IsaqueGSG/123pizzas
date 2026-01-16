import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";

import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";

import Navbar from "../../components/Navbar";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

const tiposProduto = [
    {
        id: "pizza",
        nome: "Pizzas",
        img: "https://images8.alphacoders.com/369/369063.jpg",
        descricao: "8 pedacoes"
    },
    {
        id: "broto",
        nome: "Broto",
        img: "https://images8.alphacoders.com/369/369063.jpg",
        descricao: "4 pedacoes"
    },
    {
        id: "esfiha",
        nome: "Esfiha",
        img: "https://images8.alphacoders.com/369/369063.jpg",
        descricao: ""
    },
    {
        id: "bebida",
        nome: "Bebidas",
        img: "https://st3.depositphotos.com/1063437/13933/i/1600/depositphotos_139337744-stock-photo-bottles-of-assorted-coca-cola.jpg",
        descricao: ""
    }
];

export default function Categorias() {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 2 }}>

            <Navbar />
            <Toolbar />
            <CarrinhoDrawer />

            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Escolha o tipo do produto
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 2
                }}
            >
                {
                    tiposProduto.map((cat, index) => (
                        <Card key={index}>
                            <CardActionArea
                                onClick={() => navigate(`/cardapio/${cat.id}`)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1.5,
                                    mb: 1,
                                    borderRadius: 2
                                }}
                            >

                                {/* IMAGEM */}
                                <Avatar
                                    src={cat.img}
                                    variant="rounded"
                                    sx={{ width: 56, height: 56, mr: 1.5 }}
                                />

                                {/* INFO */}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography fontWeight="bold" fontSize={14}>
                                        {cat.nome}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {cat.descricao}
                                    </Typography>
                                </Box>
                            </CardActionArea>
                        </Card>
                    ))
                }

            </Box>
        </Box>
    );
}
