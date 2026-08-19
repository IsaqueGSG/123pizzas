import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Snackbar,
    Alert
} from "@mui/material";

import { v4 as uuidv4 } from "uuid";

import AdminDrawer from "../../components/AdminDrawer";

import { addProduto as addProdutoService } from "../../services/produtos.service";
import {
    uploadImagemProduto,
    removerImagemRef
} from "../../services/storage";

import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

export default function AddProduto() {

    const { idLoja } = useLoja();
    const { categorias, addProduto } = useProducts();

    const [imagemFile, setImagemFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [salvando, setSalvando] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        msg: "",
        severity: "success"
    });

    const [produto, setProduto] = useState({
        nome: "",
        descricao: "",
        valor: "",
        categoriaId: "",
        observacao: "",
        status: true
    });

    const selecionarImagem = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSnackbar({
                open: true,
                msg: "Selecione uma imagem válida.",
                severity: "warning"
            });

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setSnackbar({
                open: true,
                msg: "A imagem deve ter no máximo 10 MB.",
                severity: "warning"
            });

            return;
        }

        setImagemFile(file);

        const url = URL.createObjectURL(file);

        setPreview(url);
    };

    const salvar = async () => {

        const { nome, valor, categoriaId } = produto;

        if (
            !nome.trim() ||
            !valor ||
            !categoriaId
        ) {
            setSnackbar({
                open: true,
                msg: "Preencha todos os campos obrigatórios.",
                severity: "warning"
            });

            return;
        }

        let imagemStorageRef = null;

        try {

            setSalvando(true);

            // UUID gerado localmente
            const idProduto = uuidv4();

            let imagemUrl = "";

            /*
             * 1. Upload da imagem
             */
            if (imagemFile) {

                const resultado =
                    await uploadImagemProduto(
                        imagemFile,
                        idLoja,
                        idProduto
                    );

                imagemUrl = resultado.url;
                imagemStorageRef = resultado.storageRef;
            }

            /*
             * 2. Uma única escrita no Firestore
             */
            await addProdutoService(
                idLoja,
                idProduto,
                {
                    ...produto,
                    valor: Number(valor),
                    img: imagemUrl,
                    imgVersion: imagemUrl
                        ? Date.now()
                        : null
                }
            );

            /*
             * 3. Atualiza contexto local
             */
            addProduto({
                ...produto,
                id: idProduto,
                valor: Number(valor),
                img: imagemUrl
            });

            /*
             * 4. Limpa formulário
             */
            setProduto({
                nome: "",
                descricao: "",
                valor: "",
                categoriaId: "",
                observacao: "",
                status: true
            });

            setImagemFile(null);
            setPreview("");

            setSnackbar({
                open: true,
                msg: "Produto adicionado com sucesso!",
                severity: "success"
            });

        } catch (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            /*
             * Se o Storage já recebeu a imagem,
             * mas alguma etapa posterior falhou,
             * remove a imagem para evitar órfão.
             */
            if (imagemStorageRef) {

                await removerImagemRef(
                    imagemStorageRef
                );
            }

            setSnackbar({
                open: true,
                msg:
                    error.message ||
                    "Erro ao salvar produto.",
                severity: "error"
            });

        } finally {

            setSalvando(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>

            <AdminDrawer />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar(s => ({
                        ...s,
                        open: false
                    }))
                }
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.msg}
                </Alert>
            </Snackbar>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 3
                }}
            >

                <TextField
                    label="Nome do produto"
                    value={produto.nome}
                    onChange={e =>
                        setProduto(p => ({
                            ...p,
                            nome: e.target.value
                        }))
                    }
                />

                <TextField
                    label="Descrição"
                    value={produto.descricao}
                    onChange={e =>
                        setProduto(p => ({
                            ...p,
                            descricao: e.target.value
                        }))
                    }
                />

                <Button
                    variant="outlined"
                    component="label"
                >
                    {imagemFile
                        ? "Alterar imagem"
                        : "Selecionar imagem"}

                    <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={selecionarImagem}
                    />
                </Button>

                {preview && (
                    <Box
                        component="img"
                        src={preview}
                        alt="Preview"
                        sx={{
                            width: 200,
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 2
                        }}
                    />
                )}

                <TextField
                    label="Valor"
                    type="number"
                    value={produto.valor}
                    onChange={e =>
                        setProduto(p => ({
                            ...p,
                            valor: e.target.value
                        }))
                    }
                />

                <TextField
                    select
                    label="Categoria"
                    value={produto.categoriaId}
                    onChange={e =>
                        setProduto(p => ({
                            ...p,
                            categoriaId: e.target.value
                        }))
                    }
                >
                    {categorias
                        .filter(cat => cat.status)
                        .map(cat => (
                            <MenuItem
                                key={cat.id}
                                value={cat.id}
                            >
                                {cat.nome}
                            </MenuItem>
                        ))}
                </TextField>

                <Button
                    variant="contained"
                    onClick={salvar}
                    disabled={salvando}
                >
                    {salvando
                        ? "Salvando..."
                        : "Salvar Produto"}
                </Button>

            </Box>

        </Box>
    );
}