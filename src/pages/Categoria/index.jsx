import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";

import Carrinho from "../../components/Carrinho";

const categorias = [
    {
        id: "pizza",
        nome: "Pizzas",
        img: "https://images8.alphacoders.com/369/369063.jpg"
    },
    {
        id: "broto",
        nome: "Broto",
        img: "https://images8.alphacoders.com/369/369063.jpg"
    },
    {
        id: "bebida",
        nome: "Bebidas",
        img: "https://images8.alphacoders.com/369/369063.jpg"
    }
];

export default function Categorias() {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 2 }}>
            {/* Navbar / Carrinho */}
            <Carrinho />

            {/* Espaçamento da AppBar */}
            <Toolbar />

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
                    categorias.map((cat, index )=> (
                        <Card key={index}>
                            <CardActionArea onClick={() => navigate(`/cardapio/${cat.id}`)}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={cat.img}
                                />
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        {cat.nome}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))
                }

            </Box>
        </Box>
    );
}
