import { useState } from "react";

import { Box, TextField, Button, Toolbar, Typography } from "@mui/material"

import { addProduto } from "../../services/produtos.service";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";


export default function AddProduto() {

    const tipos = ["pizza", "bebida"]

    const [novoProduto, setNovoProduto] = useState({
        nome: "",
        descricao: "",
        tipo: "pizza",
        ingredientes: "",
        img: "",
        valor: ""
    });


    const salvarNovoProduto = async () => {

        if (!novoProduto.nome || !novoProduto.valor) {
            alert("Preencha nome e valor");
            return;
        }

        const produto = {
            ...novoProduto,
            valor: Number(novoProduto.valor),
            status: true
        };

        if (produto.tipo !== "pizza") {
            delete produto.ingredientes;
        }

        await addProduto(produto);


        setNovoProduto({
            nome: "",
            descricao: "",
            tipo: "pizza",
            ingredientes: "",
            img: "",
            valor: ""
        });
    };


    return (
        <Box sx={{ p: 2 }}>
            <Navbar />
            <Toolbar />
            <AdminDrawer />

            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Adicionar Produto
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                    component="img"
                    src={novoProduto.img || null}
                    sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
                />

                <Box sx={{ display: "flex", gap: 1 }}>
                    {tipos.map((tipo, index) => (
                        <Button
                            key={index}
                            fullWidth
                            variant={novoProduto.tipo === tipo ? "contained" : "outlined"}
                            onClick={() =>
                                setNovoProduto((p) => ({ ...p, tipo }))
                            }
                        >
                            {tipo}
                        </Button>

                    ))}
                </Box>

                <TextField
                    label="Nome"
                    value={novoProduto.nome}
                    onChange={(e) =>
                        setNovoProduto((p) => ({ ...p, nome: e.target.value }))
                    }
                />

                <TextField
                    label="Descrição"
                    value={novoProduto.descricao}
                    onChange={(e) =>
                        setNovoProduto((p) => ({ ...p, descricao: e.target.value }))
                    }
                />


                {novoProduto.tipo === "pizza" && (
                    <TextField
                        label="Ingredientes"
                        value={novoProduto.ingredientes}
                        onChange={(e) =>
                            setNovoProduto((p) => ({ ...p, ingredientes: e.target.value }))
                        }
                    />
                )}


                <TextField
                    label="Valor"
                    type="number"
                    value={novoProduto.valor}
                    onChange={(e) =>
                        setNovoProduto((p) => ({ ...p, valor: e.target.value }))
                    }
                />

                <TextField
                    label="Link da imagem"
                    value={novoProduto.img}
                    onChange={(e) =>
                        setNovoProduto((p) => ({ ...p, img: e.target.value }))
                    }
                />

                <Button variant="contained" onClick={salvarNovoProduto}>
                    Salvar Produto
                </Button>

            </Box>
        </Box>
    )

}