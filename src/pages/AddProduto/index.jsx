import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Divider,
    Typography,
    Toolbar
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { addProduto } from "../../services/produtos.service";
import { useLoja } from "../../contexts/LojaContext";

const TIPOS = [
    { key: "pizza", label: "Pizza" },
    { key: "broto", label: "Broto" },
    { key: "esfiha", label: "Esfiha" },
    { key: "bebida", label: "Bebida" },
    { key: "extra", label: "Extra" },
    { key: "borda", label: "Borda" }
];

export default function AddProduto() {
    const { idLoja } = useLoja();

    const [produto, setProduto] = useState({
        nome: "",
        img: ""
    });

    const [tipos, setTipos] = useState({
        pizza: false,
        broto: false,
        esfiha: false,
        bebida: false,
        extra: false,
        borda: false
    });

    const [dados, setDados] = useState({
        pizza: { valor: 0, descricao: "" },
        broto: { valor: 0, descricao: "" },
        esfiha: { valor: 0, descricao: "" },
        bebida: { valor: 0, descricao: "" },
        extra: { valor: 0, descricao: "" },
        borda: { valor: 0, descricao: "" }
    });

    const salvar = async () => {
        if (!produto.nome.trim()) {
            alert("Informe o nome do produto");
            return;
        }

        const produtos = [];

        Object.entries(tipos).forEach(([tipo, ativo]) => {
            if (!ativo) return;

            if (dados[tipo].valor <= 0) {
                alert(`Informe um valor válido para ${tipo}`);
                return;
            }

            produtos.push({
                nome: produto.nome,
                img: produto.img,
                descricao: dados[tipo].descricao,
                valor: Number(dados[tipo].valor),
                tipo,
                status: true
            });
        });

        if (!produtos.length) {
            alert("Selecione pelo menos um tipo");
            return;
        }

        await Promise.all(
            produtos.map(p => addProduto(idLoja, p))
        );

        setProduto({ nome: "", img: "" });
        setTipos({
            pizza: false,
            broto: false,
            esfiha: false,
            bebida: false,
            extra: false,
            borda: false
        });
        setDados({
            pizza: { valor: 0, descricao: "" },
            broto: { valor: 0, descricao: "" },
            esfiha: { valor: 0, descricao: "" },
            bebida: { valor: 0, descricao: "" },
            extra: { valor: 0, descricao: "" },
            borda: { valor: 0, descricao: "" }
        });

        alert("Produto adicionado com sucesso!");
    };


    return (
        <Box sx={{ p: 2 }}>
            <Navbar />
            <Toolbar />
            <AdminDrawer />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
                {/* Dados gerais */}
                <TextField
                    label="Nome/Sabor"
                    value={produto.nome}
                    onChange={e =>
                        setProduto(p => ({ ...p, nome: e.target.value }))
                    }
                />

                <TextField
                    label="Imagem (URL)"
                    value={produto.img}
                    onChange={e =>
                        setProduto(p => ({ ...p, img: e.target.value }))
                    }
                />

                {/* Tipos */}

                <Typography>
                    Selecione os tipos de produto
                </Typography>

                <Divider />
                {TIPOS.map(({ key, label }) => (
                    <Box key={key}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={tipos[key]}
                                    onChange={e =>
                                        setTipos(p => ({ ...p, [key]: e.target.checked }))
                                    }
                                />
                            }
                            label={label}
                        />

                        {tipos[key] && (
                            <>
                                <TextField
                                    label={`Valor (${label})`}
                                    type="number"
                                    value={dados[key].valor}
                                    onChange={e =>
                                        setDados(d => ({
                                            ...d,
                                            [key]: { ...d[key], valor: e.target.value }
                                        }))
                                    }
                                />

                                <TextField
                                    label="Descrição"
                                    value={dados[key].descricao}
                                    onChange={e =>
                                        setDados(d => ({
                                            ...d,
                                            [key]: { ...d[key], descricao: e.target.value }
                                        }))
                                    }
                                />
                            </>
                        )}

                        <Divider sx={{ my: 2 }} />
                    </Box>
                ))}

                <Button variant="contained" onClick={salvar}>
                    Salvar Produto
                </Button>
            </Box>

        </Box>
    );
}
