import { useState } from "react";

import {
    Box,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Divider
} from "@mui/material";

import { addProduto } from "../../services/produtos.service";

export default function AddSabor() {

    // Dados comuns ao sabor
    const [sabor, setSabor] = useState({
        nome: "",
        img: ""
    });

    // Tipos habilitados
    const [tipos, setTipos] = useState({
        pizza: false,
        broto: false,
        esfiha: false
    });

    // Dados específicos por tipo
    const [dadosTipo, setDadosTipo] = useState({
        pizza: { descricao: "", valor: "" },
        broto: { descricao: "", valor: "" },
        esfiha: { descricao: "", valor: "" }
    });

    const handleSalvar = async () => {
        if (!sabor.nome) {
            alert("Informe o sabor");
            return;
        }

        const produtos = [];

        Object.entries(tipos).forEach(([tipo, ativo]) => {
            if (!ativo) return;

            const dados = dadosTipo[tipo];

            if (!dados.valor) {
                alert(`Informe o valor para ${tipo}`);
                return;
            }

            produtos.push({
                nome: sabor.nome,
                img: sabor.img,
                tipo,
                descricao: dados.descricao,
                valor: Number(dados.valor),
                status: true
            });
        });

        if (!produtos.length) {
            alert("Selecione pelo menos um tipo");
            return;
        }

        for (const produto of produtos) {
            await addProduto(produto);
        }

        // reset
        setSabor({ nome: "", img: "" });
        setTipos({ pizza: false, broto: false, esfiha: false });
        setDadosTipo({
            pizza: { descricao: "", valor: "" },
            broto: { descricao: "", valor: "" },
            esfiha: { descricao: "", valor: "" }
        });

        alert("Sabor adicionado com sucesso!");
    };

    const renderCamposTipo = (tipo, label) => (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={tipos[tipo]}
                        onChange={(e) =>
                            setTipos(p => ({ ...p, [tipo]: e.target.checked }))
                        }
                    />
                }
                label={`Adicionar sabor para ${label}`}
            />

            {tipos[tipo] && (
                <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                        label="Descrição"
                        value={dadosTipo[tipo].descricao}
                        onChange={(e) =>
                            setDadosTipo(p => ({
                                ...p,
                                [tipo]: { ...p[tipo], descricao: e.target.value }
                            }))
                        }
                    />

                    <TextField
                        label={`Valor (${label})`}
                        type="number"
                        value={dadosTipo[tipo].valor}
                        onChange={(e) =>
                            setDadosTipo(p => ({
                                ...p,
                                [tipo]: { ...p[tipo], valor: e.target.value }
                            }))
                        }
                    />
                </Box>
            )}

            <Divider sx={{ my: 2 }} />
        </>
    );

    return (

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
            <Box
                component="img"
                src={sabor.img || null}
                sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
            />

            <TextField
                label="Sabor"
                value={sabor.nome}
                onChange={(e) =>
                    setSabor(p => ({ ...p, nome: e.target.value }))
                }
            />

            <TextField
                label="Link da imagem"
                value={sabor.img}
                onChange={(e) =>
                    setSabor(p => ({ ...p, img: e.target.value }))
                }
            />

            <Divider sx={{ my: 2 }} />

            {renderCamposTipo("pizza", "Pizza")}
            {renderCamposTipo("broto", "Broto")}
            {renderCamposTipo("esfiha", "Esfiha")}

            <Button variant="contained" onClick={handleSalvar}>
                Salvar Sabor
            </Button>
        </Box>
    );
}
