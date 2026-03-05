import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    Card,
    Typography,
    Stack,
    Divider
} from "@mui/material";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { useProducts } from "../../contexts/ProdutosContext";
import { updateCategoriasPosicaoBatch } from "../../services/categorias.service";
import { useLoja } from "../../contexts/LojaContext";

import {
    DndContext,
    closestCenter
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function ItemCategoria({ cat, index }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: cat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <Card
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 2,
                transition: "0.2s",
                cursor: "grab",
                "&:hover": { boxShadow: 3 },
                "&:active": { cursor: "grabbing" }
            }}
        >

            <Stack direction="row" spacing={1.5} alignItems="center">

                <Box sx={{ display: "flex" }}>
                    <DragIndicatorIcon color="disabled" />
                </Box>

                <Typography sx={{ fontWeight: 500 }}>
                    {index + 1}. {cat.nome}
                </Typography>

            </Stack>

        </Card>
    );
}

export default function PosicaoCategorias({ open, onClose }) {

    const { categorias } = useProducts();
    const { idLoja } = useLoja();

    const [listaOriginal, setListaOriginal] = useState([]);
    const [lista, setLista] = useState([]);

    useEffect(() => {
        if (categorias?.length) {
            const ordenadas = [...categorias].sort(
                (a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)
            );

            setLista(ordenadas);
            setListaOriginal(ordenadas);
        }
    }, [categorias]);

    const handleDragEnd = (event) => {

        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = lista.findIndex(i => i.id === active.id);
        const newIndex = lista.findIndex(i => i.id === over.id);

        setLista(arrayMove(lista, oldIndex, newIndex));
    };

    const salvar = async () => {

        const categoriasAtualizadas = lista.map((cat, i) => ({
            ...cat,
            posicao: i
        }));

        console.log(categoriasAtualizadas);

        await updateCategoriasPosicaoBatch(idLoja, categoriasAtualizadas);

        alert("Ordem das categorias salva com sucesso!");
        onClose();
    };

    const alterado =
        JSON.stringify(lista.map(i => i.id)) !==
        JSON.stringify(listaOriginal.map(i => i.id));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <DialogTitle sx={{ fontWeight: 600 }}>
                Ordenar Categorias
            </DialogTitle>

            <DialogContent>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Arraste as categorias para definir a ordem no cardápio.
                </Typography>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >

                    <SortableContext
                        items={lista.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >

                        <Stack spacing={1}>

                            {lista.map((cat, i) => (
                                <ItemCategoria
                                    key={cat.id}
                                    cat={cat}
                                    index={i}
                                />
                            ))}

                        </Stack>

                    </SortableContext>

                </DndContext>

            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2 }}>

                <Button onClick={onClose}>
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={salvar}
                    disabled={!alterado}
                >
                    Salvar Ordem
                </Button>

            </DialogActions>

        </Dialog>
    );
}