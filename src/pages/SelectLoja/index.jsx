import { Box, Card, CardMedia, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lojas from "../../services/IdLojas.services";

export default function SelectLoja() {
    const navigate = useNavigate();

    const escolherLoja = (idLoja) => {
        localStorage.setItem("idLoja", idLoja);

        navigate(`/${idLoja}/login`, { replace: true });
    };

    useEffect(() => {
        const saved = localStorage.getItem("idLoja");
        if (saved) {
            navigate(`/${saved}/login`, { replace: true });
        }
    }, []);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                p: 3
            }}
        >
            {lojas.map(loja => (
                <Card
                    key={loja.idLoja}
                    sx={{
                        width: 260,
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": { transform: "scale(1.03)" }
                    }}
                    onClick={() => escolherLoja(loja.idLoja)}
                >
                    <CardMedia
                        component="img"
                        height="160"
                        image={loja.img}
                        alt={loja.nome}
                    />

                    <CardContent>
                        <Typography variant="h6">
                            {loja.nome}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {loja.descricao}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
