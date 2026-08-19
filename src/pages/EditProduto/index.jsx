import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Box,
    TextField,
    Button,
    MenuItem,
    Snackbar,
    Alert,
    Typography
} from "@mui/material";

import AdminDrawer from "../../components/AdminDrawer";

import { useProducts } from "../../contexts/ProdutosContext";
import { useLoja } from "../../contexts/LojaContext";

import {
    updateProduto as updateProdutoService
} from "../../services/produtos.service";

import {
    uploadImagemProduto
} from "../../services/storage";


export default function EditProduto() {

    const navigate = useNavigate();
    const { IDproduto } = useParams();

    const {
        produtos,
        loading,
        categorias,
        updateProduto
    } = useProducts();

    const { idLoja } = useLoja();


    /*
     * Produto original encontrado no contexto
     */
    const [produto, setProduto] = useState(null);


    /*
     * Arquivo de imagem selecionado pelo usuário
     */
    const [imagemFile, setImagemFile] = useState(null);


    /*
     * Preview da imagem.
     *
     * Inicialmente será a imagem já salva no produto.
     * Quando o usuário selecionar uma nova imagem,
     * será substituído pelo objectURL da nova imagem.
     */
    const [preview, setPreview] = useState("");


    /*
     * Controle de salvamento
     */
    const [salvando, setSalvando] = useState(false);


    /*
     * Snackbar
     */
    const [snackbar, setSnackbar] = useState({
        open: false,
        msg: "",
        severity: "success"
    });


    /*
     * Formulário
     */
    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        valor: "",
        categoriaId: "",
        observacao: "",
        status: true
    });


    /*
     * Busca o produto no contexto.
     */
    useEffect(() => {

        if (loading) return;

        const encontrado = produtos.find(
            p => p.id === IDproduto
        );

        if (!encontrado) {

            setSnackbar({
                open: true,
                msg: "Produto não encontrado.",
                severity: "error"
            });

            navigate(-1);

            return;
        }

        setProduto(encontrado);

    }, [
        IDproduto,
        produtos,
        loading,
        navigate
    ]);


    /*
     * Preenche o formulário quando o produto
     * for carregado.
     */
    useEffect(() => {

        if (!produto) return;

        setForm({
            nome: produto.nome || "",
            descricao: produto.descricao || "",
            valor: produto.valor ?? "",
            categoriaId: produto.categoriaId || "",
            observacao: produto.observacao || "",
            status: produto.status ?? true
        });


        /*
         * A imagem atual do produto é utilizada
         * como preview inicial.
         */
        setPreview(produto.img || "");

    }, [produto]);


    /*
     * Seleciona uma nova imagem.
     */
    const selecionarImagem = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;


        /*
         * Validação do tipo
         */
        if (!file.type.startsWith("image/")) {

            setSnackbar({
                open: true,
                msg: "Selecione uma imagem válida.",
                severity: "warning"
            });

            return;
        }


        /*
         * Limite da imagem original
         */
        if (file.size > 10 * 1024 * 1024) {

            setSnackbar({
                open: true,
                msg: "A imagem deve ter no máximo 10 MB.",
                severity: "warning"
            });

            return;
        }


        /*
         * Guarda o arquivo para o upload
         */
        setImagemFile(file);


        /*
         * Cria preview local
         */
        const url = URL.createObjectURL(file);

        setPreview(url);
    };


    /*
     * Salva as alterações.
     */
    const salvar = async () => {

        const {
            nome,
            valor,
            categoriaId
        } = form;


        /*
         * Validação
         */
        if (
            !nome.trim() ||
            !valor ||
            Number(valor) <= 0 ||
            !categoriaId
        ) {

            setSnackbar({
                open: true,
                msg: "Preencha todos os campos obrigatórios.",
                severity: "warning"
            });

            return;
        }


        try {

            setSalvando(true);


            /*
             * Mantém a imagem atual por padrão.
             */
            let imagemUrl = produto.img || "";

            let novaImagem = false;


            /*
             * Se o usuário escolheu uma nova imagem,
             * faz o upload.
             */
            if (imagemFile) {

                const resultado =
                    await uploadImagemProduto(
                        imagemFile,
                        idLoja,
                        produto.id
                    );

                imagemUrl = resultado.url;

                novaImagem = true;
            }


            /*
             * Dados que serão enviados ao Firestore.
             */
            const dadosAtualizados = {

                nome: form.nome.trim(),

                descricao: form.descricao,

                valor: Number(form.valor),

                categoriaId: form.categoriaId,

                observacao: form.observacao,

                status: form.status,

                img: imagemUrl,

                /*
                 * Só altera a versão quando
                 * realmente houve uma nova imagem.
                 */
                ...(novaImagem && {
                    imgVersion: Date.now()
                })
            };


            /*
             * Atualiza Firestore
             */
            await updateProdutoService(
                idLoja,
                produto.id,
                dadosAtualizados
            );


            /*
             * Atualiza o contexto local.
             */
            updateProduto(
                produto.id,
                dadosAtualizados
            );


            /*
             * Atualiza o produto local também.
             */
            setProduto(p => ({
                ...p,
                ...dadosAtualizados
            }));


            /*
             * Remove referência ao arquivo selecionado.
             */
            setImagemFile(null);


            /*
             * Atualiza o preview para a URL do Storage.
             */
            setPreview(imagemUrl);


            /*
             * Limpa o input de arquivo.
             */
            const input =
                document.getElementById(
                    "imagem-produto-input"
                );

            if (input) {
                input.value = "";
            }


            setSnackbar({
                open: true,
                msg: "Produto atualizado com sucesso!",
                severity: "success"
            });

        } catch (error) {

            console.error(
                "Erro ao atualizar produto:",
                error
            );


            /*
             * IMPORTANTE:
             *
             * Não removemos a imagem aqui.
             *
             * Como o caminho do Storage é:
             *
             * lojas/{idLoja}/produtos/{idProduto}.webp
             *
             * o novo upload sobrescreve a imagem anterior.
             *
             * Portanto, remover o arquivo nesse ponto
             * poderia deixar o produto sem imagem.
             */

            setSnackbar({
                open: true,
                msg:
                    error.message ||
                    "Erro ao atualizar produto.",
                severity: "error"
            });

        } finally {

            setSalvando(false);
        }
    };


    /*
     * Enquanto o produto não estiver carregado.
     */
    if (loading || !produto) {

        return (
            <Box sx={{ p: 2 }}>

                <AdminDrawer />

                <Typography>
                    Carregando produto...
                </Typography>

            </Box>
        );
    }


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
                    value={form.nome}
                    onChange={e =>
                        setForm(f => ({
                            ...f,
                            nome: e.target.value
                        }))
                    }
                />


                <TextField
                    label="Descrição"
                    multiline
                    rows={3}
                    value={form.descricao}
                    onChange={e =>
                        setForm(f => ({
                            ...f,
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
                        : "Selecionar nova imagem"
                    }

                    <input
                        id="imagem-produto-input"
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
                        alt={form.nome}
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
                    value={form.valor}
                    onChange={e =>
                        setForm(f => ({
                            ...f,
                            valor: e.target.value
                        }))
                    }
                    inputProps={{
                        min: 0,
                        step: "0.01"
                    }}
                />


                <TextField
                    select
                    label="Categoria"
                    value={form.categoriaId}
                    onChange={e =>
                        setForm(f => ({
                            ...f,
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
                        : "Salvar Alterações"
                    }

                </Button>

            </Box>

        </Box>
    );
}