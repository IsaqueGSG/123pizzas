// src/services/storage.js

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";

import { storage } from "../config/firebase";


/**
 * Comprime e converte uma imagem para WebP.
 */
async function comprimirImagem(
    file,
    {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.80
    } = {}
) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxWidth || height > maxHeight) {
                const proporcao = Math.min(
                    maxWidth / width,
                    maxHeight / height
                );

                width = Math.round(width * proporcao);
                height = Math.round(height * proporcao);
            }

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(
                    new Error(
                        "Não foi possível processar a imagem."
                    )
                );

                return;
            }

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            canvas.toBlob(
                blob => {
                    if (!blob) {
                        reject(
                            new Error(
                                "Não foi possível converter a imagem para WebP."
                            )
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Não foi possível carregar a imagem."
                )
            );
        };

        img.src = objectUrl;
    });
}


/**
 * Comprime + converte + envia a imagem para o Storage.
 */
export async function uploadImagemProduto(
    file,
    idLoja,
    idProduto
) {
    if (!file) {
        throw new Error("Nenhuma imagem selecionada.");
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("O arquivo precisa ser uma imagem.");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error(
            "A imagem original deve ter no máximo 10 MB."
        );
    }

    const imagemWebp = await comprimirImagem(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.80
    });

    const caminho =
        `lojas/${idLoja}/produtos/${idProduto}.webp`;

    const storageRef = ref(storage, caminho);

    await uploadBytes(
        storageRef,
        imagemWebp,
        {
            contentType: "image/webp",

            // Cache longo, mas NÃO immutable.
            // A imagem pode ser substituída posteriormente.
            cacheControl: "public,max-age=31536000"
        }
    );

    const url = await getDownloadURL(storageRef);

    return {
        url,
        storageRef
    };
}


/**
 * Remove uma imagem específica.
 */
export async function removerImagemProduto(
    idLoja,
    idProduto
) {
    const caminho =
        `lojas/${idLoja}/produtos/${idProduto}.webp`;

    const storageRef = ref(storage, caminho);

    try {
        await deleteObject(storageRef);
    } catch (error) {

        if (
            error.code !==
            "storage/object-not-found"
        ) {
            throw error;
        }
    }
}


/**
 * Remove diretamente um arquivo enviado
 * durante uma operação que falhou.
 */
export async function removerImagemRef(storageRef) {
    if (!storageRef) return;

    try {
        await deleteObject(storageRef);
    } catch (error) {

        if (
            error.code !==
            "storage/object-not-found"
        ) {
            console.error(
                "Erro ao remover imagem órfã:",
                error
            );
        }
    }
}