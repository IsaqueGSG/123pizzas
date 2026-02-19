import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Toolbar,
    MenuItem,
    Snackbar,
    Alert
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import { addProduto as addProdutoService } from "../../services/produtos.service";
import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AddProduto() {
    const { idLoja } = useLoja();
    const { categorias, addProduto } = useProducts();

    const [snackbar, setSnackbar] = useState({
        open: false,
        msg: "",
        severity: "success"
    });

    const [produto, setProduto] = useState({
        nome: "",
        descricao: "",
        img: "",
        valor: "",
        categoriaId: "",
        observacao: "",
        status: true
    });

    const salvar = async () => {
        const { nome, valor, categoriaId } = produto;

        if (!nome || !valor || !categoriaId) {
            setSnackbar({
                open: true,
                msg: "Preencha todos os campos obrigatórios",
                severity: "warning"
            });
            return;
        }

        const idProduto = await addProdutoService(idLoja, {
            ...produto,
            valor: Number(valor)
        });

        addProduto({ ...produto, id: idProduto });

        setProduto({
            nome: "",
            descricao: "",
            img: "",
            valor: "",
            categoriaId: "",
            observacao: "",
            status: true
        });

        setSnackbar({
            open: true,
            msg: "Produto adicionado com sucesso!",
            severity: "success"
        });
    };

    return (
        <Box sx={{ p: 2 }}>
            <Navbar />
            <Toolbar />
            <AdminDrawer />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.msg}
                </Alert>
            </Snackbar>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
                <TextField
                    label="Nome do produto"
                    value={produto.nome}
                    onChange={e => setProduto(p => ({ ...p, nome: e.target.value }))}
                />

                <TextField
                    label="Descrição"
                    value={produto.descricao}
                    onChange={e => setProduto(p => ({ ...p, descricao: e.target.value }))}
                />

                <TextField
                    label="Imagem (URL)"
                    value={produto.img}
                    onChange={e => setProduto(p => ({ ...p, img: e.target.value }))}
                />

                <TextField
                    label="Valor"
                    type="number"
                    value={produto.valor}
                    onChange={e => setProduto(p => ({ ...p, valor: e.target.value }))}
                />

                <TextField
                    select
                    label="Categoria"
                    value={produto.categoriaId}
                    onChange={e =>
                        setProduto(p => ({ ...p, categoriaId: e.target.value }))
                    }
                >
                    {categorias
                        .filter(cat => cat.status)
                        .map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.nome}
                            </MenuItem>
                        ))}
                </TextField>

                <Button variant="contained" onClick={salvar}>
                    Salvar Produto
                </Button>
            </Box>

        </Box>
    );
}
