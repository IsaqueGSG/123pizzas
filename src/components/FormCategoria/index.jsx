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
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

import { gerarSlug } from "../../services/categorias.service";
import { center } from "@turf/turf";

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
            gruposExtras: [],
            createdAt: null,
            horarioFuncionamento: {
                inicio: "00:00",
                fim: "23:59"
            }
        }
    );

    const [novoGrupo, setNovoGrupo] = useState({
        nome: "",
        limite: 1,
        minimo: 0
    });

    const [novoItem, setNovoItem] = useState({
        nome: "",
        valor: 0
    });

    const [grupoSelecionado, setGrupoSelecionado] = useState(null);

    const adicionarGrupo = () => {
        if (!novoGrupo.nome.trim()) {
            return alert("Nome inválido");
        }

        if (novoGrupo.minimo > novoGrupo.limite) {
            return alert("Mínimo não pode ser maior que o limite");
        }

        const id = gerarSlug(novoGrupo.nome);

        if (categoria.gruposExtras?.some(g => g.id === id)) {
            return alert("Já existe um grupo com esse nome");
        }

        setCategoria(prev => ({
            ...prev,
            gruposExtras: [
                ...(prev.gruposExtras || []),
                {
                    ...novoGrupo,
                    id,
                    status: true,
                    itens: []
                }
            ]
        }));

        // reset inteligente
        setNovoGrupo({
            nome: "",
            limite: 1,
            minimo: 0
        });
    };

    const removerGrupo = (grupoId) => {
        setCategoria(prev => ({
            ...prev,
            gruposExtras: prev.gruposExtras.filter(g => g.id !== grupoId)
        }));

        // limpa seleção se estava editando esse grupo
        if (grupoSelecionado === grupoId) {
            setGrupoSelecionado(null);
        }
    };

    const adicionarItem = () => {
        if (!grupoSelecionado) return;

        const nome = novoItem.nome.trim();

        if (!nome) {
            return alert("Nome do item inválido");
        };

        const id = gerarSlug(nome);

        const grupo = categoria.gruposExtras?.find(g => g.id === grupoSelecionado);
        if (!grupo) return;

        if (grupo?.itens.some(i => i.id === id)) {
            return alert("Item já existe");
        }


        setCategoria(prev => ({
            ...prev,
            gruposExtras: prev.gruposExtras.map(g =>
                g.id === grupoSelecionado
                    ? {
                        ...g,
                        itens: [
                            ...g.itens,
                            {
                                ...novoItem,
                                id,
                                valor: Number(novoItem.valor) || 0,
                                status: true
                            }
                        ]
                    }
                    : g
            )
        }));

        setNovoItem({
            nome: "",
            valor: 0,
        });
    };

    const removerItem = (grupoId, itemId) => {
        setCategoria(prev => ({
            ...prev,
            gruposExtras: prev.gruposExtras.map(g =>
                g.id === grupoId
                    ? {
                        ...g,
                        itens: g.itens.filter(i => i.id !== itemId)
                    }
                    : g
            )
        }));
    };

    const [original, setOriginal] = useState(categoriaInicial);

    const semAlteracoes =
        mode === "edit" &&
        JSON.stringify(categoria) === JSON.stringify(original);


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === "edit" && categoriaInicial) {
            setCategoria(categoriaInicial);
            setOriginal(categoriaInicial);
        }
    }, [categoriaInicial, mode]);

    useEffect(() => {
        setNovoItem({
            nome: "",
            valor: 0
        });
    }, [grupoSelecionado]);

    const salvarCategoria = async () => {
        if (!categoria.nome.trim()) return;

        setLoading(true);

        try {
            const payload = {
                ...categoria,
                updatedAt: new Date(),
                ...(mode === "add" ? { createdAt: new Date() } : {})
            };

            await onSave(payload);

            if (mode == "add") {
                setCategoria({
                    nome: "",
                    permiteMisto: false,
                    status: true,
                    gruposExtras: [],
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

    function ControlImputNumber({ nomeCampo, value, setValue }) {

        const incrementar = () => setValue(value + 1);
        const decrementar = () => setValue(Math.max(0, value - 1));

        return (
            <Box>
                <Typography variant="caption" color="text.secondary">
                    {nomeCampo}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        px: 1,
                        py: 0.2,
                        minWidth: 100
                    }}
                >
                    <IconButton size="small" onClick={decrementar}>
                        <RemoveIcon fontSize="small" />
                    </IconButton>

                    <Typography fontWeight="bold" fontSize={14}>
                        {value}
                    </Typography>

                    <IconButton size="small" onClick={incrementar}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        );
    }

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


            {/* Extras */}
            <Divider sx={{ my: 2 }} />

            {/* Criar grupo */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "2fr 1fr 1fr auto"
                    },
                    gap: 2,
                    my: 2,
                    alignItems: "center"
                }}
            >
                <TextField
                    size="large"
                    label="Nome do grupo"
                    value={novoGrupo.nome}
                    onChange={(e) =>
                        setNovoGrupo(prev => ({ ...prev, nome: e.target.value }))
                    }
                />

                <ControlImputNumber
                    nomeCampo="Mínimo"
                    value={novoGrupo.minimo}
                    setValue={(val) =>
                        setNovoGrupo(prev => ({
                            ...prev,
                            minimo: Math.max(0, Math.min(val, prev.limite))
                        }))
                    }
                />

                <ControlImputNumber
                    nomeCampo="Limite"
                    value={novoGrupo.limite}
                    setValue={(val) =>
                        setNovoGrupo(prev => {
                            const limite = val <= 0 ? 1 : val;

                            return {
                                ...prev,
                                limite,
                                minimo: Math.min(prev.minimo, limite)
                            };
                        })
                    }
                />
                <Button variant="contained" size="large" onClick={adicionarGrupo}>
                    Criar Grupo
                </Button>
            </Box>

            {/* Lista de grupos */}
            {categoria.gruposExtras?.map(grupo => (
                <Box key={grupo.id} sx={{ border: "1px solid #ccc", p: 2, mb: 2, width: "100%" }}>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>

                            {/* Selecionar grupo pra adicionar item */}
                            <Button
                                variant={grupoSelecionado === grupo.id ? "contained" : "outlined"}
                                onClick={() =>
                                    setGrupoSelecionado(prev =>
                                        prev === grupo.id ? null : grupo.id
                                    )
                                }
                            >
                                {grupoSelecionado === grupo.id ? "Fechar" : "Adicionar item"}
                            </Button>

                            <Typography fontWeight="bold">
                                {grupo.nome} (Mín: {grupo.minimo} | Máx: {grupo.limite})
                            </Typography>
                        </Box>

                        <IconButton onClick={() => removerGrupo(grupo.id)}>
                            <DeleteIcon />
                        </IconButton>


                    </Box>

                    {grupoSelecionado === grupo.id && (
                        <Box sx={{ display: "flex", gap: 1, my: 1 }}>
                            <TextField
                                label="Nome"
                                value={novoItem.nome}
                                onChange={e => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                            />
                            <TextField
                                label="Valor"
                                type="number"
                                value={novoItem.valor}
                                onChange={e => setNovoItem(prev => ({ ...prev, valor: Number(e.target.value) }))}
                            />
                            <Button onClick={adicionarItem}>
                                Adicionar
                            </Button>
                        </Box>
                    )}

                    {grupo.itens.map(item => (
                        <Box
                            key={item.id}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: "1px solid #ccc",
                                borderRadius: 1,
                                p: 1,
                                my: 1
                            }}
                        >
                            <Typography>
                                {item.nome} (+R$ {item.valor.toFixed(2)})
                            </Typography>

                            <IconButton onClick={() => removerItem(grupo.id, item.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            ))}

            <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={
                    semAlteracoes ||
                    loading ||
                    !categoria.nome.trim() ||

                    // validação simples: se tem grupos de extras, cada grupo deve ter pelo menos 1 item
                    categoria.gruposExtras?.some(g =>
                        !g.nome ||
                        !Array.isArray(g.itens) ||
                        g.itens.length === 0 ||
                        g.minimo > g.limite
                    )
                }
                onClick={salvarCategoria}
            >
                Salvar Categoria
            </Button>
        </Paper >
    );
}
