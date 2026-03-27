import { useState, useEffect } from "react";

import {
    Box,
    TextField,
    Button,
    Typography,
    Switch,
    FormControlLabel,
    Paper,
    IconButton,
    Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { gerarSlug } from "../../services/categorias.service";

export default function CategoriaForm({
    mode = "add", // "add" | "edit"
    categoriaInicial = null,
    onSave
}) {

    const [categoria, setCategoria] = useState(
        categoriaInicial ?? {
            nome: "",
            permiteMisto: false,
            status: true,
            limiteExtras: 5,
            extras: [],
            bordas: [],
            createdAt: null,
            horarioFuncionamento: {
                inicio: "00:00",
                fim: "23:59"
            }

        }
    );

    const [original, setOriginal] = useState(categoriaInicial);

    const semAlteracoes =
        mode === "edit" &&
        JSON.stringify(categoria) === JSON.stringify(original);

    // estados temporários (inputs)
    const [suportaExtra, setSuportaExtra] = useState(
        (categoriaInicial?.extras?.length ?? 0) > 0
    );

    const [suportaBorda, setSuportaBorda] = useState(
        (categoriaInicial?.bordas?.length ?? 0) > 0
    );

    const [novoExtraNome, setNovoExtraNome] = useState("");
    const [novoExtraValor, setNovoExtraValor] = useState(0);
    const [novaBordaNome, setNovaBordaNome] = useState("");
    const [novaBordaValor, setNovaBordaValor] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (categoriaInicial) {
            setCategoria(categoriaInicial);
            setOriginal(categoriaInicial);
            setSuportaExtra((categoriaInicial.extras?.length ?? 0) > 0);
            setSuportaBorda((categoriaInicial.bordas?.length ?? 0) > 0);
        }
    }, [categoriaInicial]);


    const adicionarExtra = () => {
        const nome = novoExtraNome.trim();
        const valor = parseFloat(novoExtraValor);
        if (!nome || isNaN(valor)) return alert("Extra inválido");

        const id = gerarSlug(nome);

        setCategoria(prev => ({
            ...prev,
            extras: [...prev.extras, { id, nome, valor, status: true }],
        }));

        setNovoExtraNome("");
        setNovoExtraValor("");
    };

    const removerExtra = (id) => {
        setCategoria(prev => ({
            ...prev,
            extras: prev.extras.filter(e => e.id !== id)
        }));
    };

    const adicionarBorda = () => {
        const nome = novaBordaNome.trim();
        const valor = parseFloat(novaBordaValor);
        if (!nome || isNaN(valor)) return alert("Borda inválida");

        const id = gerarSlug(nome);

        setCategoria(prev => ({
            ...prev,
            bordas: [...prev.bordas, { id, nome, valor, status: true }]
        }));

        setNovaBordaNome("");
        setNovaBordaValor("");
    };

    const removerBorda = (id) => {
        setCategoria(prev => ({
            ...prev,
            bordas: prev.bordas.filter(b => b.id !== id)
        }));
    };

    const salvarCategoria = async () => {
        if (!categoria.nome.trim()) return;

        setLoading(true);

        try {
            const payload = {
                ...categoria,
                extras: suportaExtra ? categoria.extras : [],
                bordas: suportaBorda ? categoria.bordas : [],
                updatedAt: new Date(),
                ...(mode === "add" ? { createdAt: new Date() } : {})
            };

            await onSave(payload);

            if (mode == "add") {
                setSuportaBorda(false);
                setSuportaExtra(false);
                setCategoria({
                    nome: "",
                    permiteMisto: false,
                    status: true,
                    limiteExtras: 5,
                    extras: [],
                    bordas: [],
                    createdAt: null,
                    horarioFuncionamento: {
                        inicio: "00:00",
                        fim: "23:59"
                    }
                })
            }

            alert(
                mode === "add"
                    ? "Categoria criada com sucesso!"
                    : "Categoria atualizada com sucesso!"
            );
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar categoria");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {mode === "add" ? "Nova Categoria" : "Editar Categoria"}
            </Typography>

            <TextField
                label="Nome da categoria"
                fullWidth
                value={categoria.nome}
                onChange={e =>
                    setCategoria(prev => ({ ...prev, nome: e.target.value }))
                }
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                    label="Início"
                    type="time"
                    value={categoria?.horarioFuncionamento?.inicio || "00:00"}
                    onChange={(e) =>
                        setCategoria(prev => ({
                            ...prev,
                            horarioFuncionamento: {
                                ...(prev.horarioFuncionamento || {}),
                                inicio: e.target.value
                            }
                        }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />

                <TextField
                    label="Fim"
                    type="time"
                    value={categoria?.horarioFuncionamento?.fim || "23:59"}
                    onChange={(e) =>
                        setCategoria(prev => ({
                            ...prev,
                            horarioFuncionamento: {
                                ...(prev.horarioFuncionamento || {}),
                                fim: e.target.value
                            }
                        }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
                control={
                    <Switch
                        checked={categoria.permiteMisto}
                        onChange={e =>
                            setCategoria(prev => ({
                                ...prev,
                                permiteMisto: e.target.checked
                            }))
                        }
                    />
                }
                label="Permitir produto (1/2) - indicado para pizzas e brotos"
            />

            <Divider sx={{ my: 2 }} />

            {/* Bordas */}
            <FormControlLabel
                control={
                    <Switch
                        checked={suportaBorda}
                        onChange={e => setSuportaBorda(e.target.checked)}
                    />
                }
                label="Adicionar bordas aos produtos desta categoria - indicado para pizzas e brotos"
            />
            {suportaBorda && (
                <>
                    <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                        <TextField fullWidth label="Nome da borda" value={novaBordaNome} onChange={e => setNovaBordaNome(e.target.value)} />
                        <TextField
                            fullWidth
                            label="Valor"
                            type="number"
                            value={novaBordaValor}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setNovaBordaValor(value < 0 ? 0 : value);
                            }}
                            helperText={novaBordaValor == 0 ? "Valor não pode ser zero" : ""}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: novaBordaValor == 0 ? "orange" : undefined,
                                    },
                                },
                            }}
                        />
                        <Button
                            disabled={!novaBordaNome && !novaBordaValor}
                            fullWidth
                            variant="contained"
                            onClick={adicionarBorda}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    {categoria.bordas.map(borda => (
                        <Box key={borda.id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                            <Typography>{borda.nome} - R$ {borda.valor.toFixed(2)}</Typography>
                            <IconButton onClick={() => removerBorda(borda.id)}><DeleteIcon /></IconButton>
                        </Box>
                    ))}
                </>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Extras */}
            <FormControlLabel
                control={
                    <Switch
                        checked={suportaExtra}
                        onChange={e => setSuportaExtra(e.target.checked)}
                    />
                }
                label="Adicionar extras aos produtos desta categoria"
            />
            {suportaExtra && (
                <>

                    <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                        <Typography>Ajuste o limite de extras para produtos nessa categoria</Typography>
                        <TextField fullWidth label="limiteExtras" type="number" value={categoria.limiteExtras}
                            onChange={(e) => {
                                const value = e.target.value
                                setCategoria(prev => ({
                                    ...prev,
                                    limiteExtras: value < 0 ? 0 : value,
                                }));
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                        <TextField fullWidth label="Nome do extra" value={novoExtraNome} onChange={e => setNovoExtraNome(e.target.value)} />
                        <TextField
                            fullWidth
                            label="Valor"
                            type="number"
                            value={novoExtraValor}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setNovoExtraValor(value < 0 ? 0 : value);
                            }}
                            helperText={novoExtraValor == 0 ? "Atenção:valor esta zero" : ""}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: novoExtraValor == 0 ? "orange" : undefined,
                                    },
                                },
                            }}
                        />
                        <Button
                            disabled={!novoExtraNome.trim() || novoExtraValor < 0}
                            fullWidth variant="contained"
                            onClick={adicionarExtra}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    {categoria.extras.map(extra => (
                        <Box key={extra.id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                            <Typography>{extra.nome} - R$ {extra.valor.toFixed(2)}</Typography>
                            <IconButton onClick={() => removerExtra(extra.id)}><DeleteIcon /></IconButton>
                        </Box>
                    ))}
                </>
            )}

            <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={
                    semAlteracoes ||
                    loading ||
                    !categoria.nome.trim() ||
                    (suportaExtra && categoria.extras.length === 0) ||
                    (suportaBorda && categoria.bordas.length === 0)
                }
                onClick={salvarCategoria}
            >
                Salvar Categoria
            </Button>
        </Paper>
    );
}
