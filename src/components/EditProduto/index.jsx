import { useState } from "react";

import { Box, TextField, Button, Toolbar, Typography } from "@mui/material"

import { updatePizza } from "../../services/pizzas.service";
import { updateBebida } from "../../services/bebidas.service";
import Navbar from "../../components/Navbar";

export default function AddProduto({ produto }) {
    const IdProduto = produto.id;

    const tipos = ["pizza", "bebida"]
    const [tipoSelecionado, setTipoSelecionado] = useState(produto.tipo)

    const [produtoAtualizado, setProdutoAtualizado] = useState(produto);

    const salvarEdicao = async () => {
        const dados = {
            ...produtoAtualizado,
            valor: Number(produtoAtualizado.valor),
        };

        if (produtoAtualizado.tipo === "pizza") {
            await updatePizza(IdProduto, dados);
        } else {
            await updateBebida(IdProduto, dados);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Navbar />
            <Toolbar />

            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Adicionar Produto
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                    component="img"
                    src={novoProduto.img}
                    sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
                />

                <Box sx={{ display: "flex", gap: 1 }}>
                    {tipos.map((tipo) => (
                        <Button
                            fullWidth
                            variant={tipoSelecionado === tipo ? "contained" : "outlined"}
                            onClick={() => {
                                setProdutoAtualizado((p) => ({ ...p, tipo })) //atualiza o tipo do produto
                                setTipoSelecionado(tipo)
                            }}
                        >
                            {tipo}
                        </Button>
                    ))}
                </Box>

                <TextField
                    label="Nome"
                    value={novoProduto.nome}
                    onChange={(e) =>
                        setProdutoAtualizado((p) => ({ ...p, nome: e.target.value }))
                    }
                />

                <TextField
                    label="Descrição"
                    value={novoProduto.descricao}
                    onChange={(e) =>
                        setProdutoAtualizado((p) => ({ ...p, descricao: e.target.value }))
                    }
                />


                {
                    tipoSelecionado === "pizza" && (
                        <TextField
                            label="Ingredientes"
                            value={novoProduto.ingredientes}
                            onChange={(e) =>
                                setProdutoAtualizado((p) => ({ ...p, ingredientes: e.target.value }))
                            }
                        />
                    )
                }

                <TextField
                    label="Valor"
                    type="number"
                    value={novoProduto.valor}
                    onChange={(e) =>
                        setProdutoAtualizado((p) => ({ ...p, valor: e.target.value }))
                    }
                />

                <TextField
                    label="Link da imagem"
                    value={novoProduto.img}
                    onChange={(e) =>
                        setProdutoAtualizado((p) => ({ ...p, img: e.target.value }))
                    }
                />

                <Button variant="contained" onClick={salvarEdicao}>
                    Atualizar Produto
                </Button>

            </Box>
        </Box>
    )

}