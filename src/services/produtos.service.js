import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { db } from "../config/firebase";


export async function getProdutos(idLoja) {
  console.log("Buscando produtos da loja:", idLoja);
  const snapshot = await getDocs(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getProdutosPorTipo(idLoja, tipo) {
  console.log("Buscando produtos por tipo da loja:", idLoja);

  const q = query(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), where("tipo", "==", tipo));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addProduto(idLoja, produto) {
  console.log("Adicionando produto:", produto);
  const docRef = await addDoc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), produto);
  return docRef.id;
}

export async function duplicarProduto(idLoja, produto) {
  try {
    if (!idLoja || !produto) {
      throw new Error("idLoja e produto são obrigatórios");
    }

    const produtosRef = collection(
      db,
      "clientes123pedidos",
      idLoja,
      "produtos"
    );

    // Remove campos que NÃO devem ser copiados
    const { id, createdAt, ...produtoSemId } = produto;

    const novoProduto = {
      ...produtoSemId,
      nome: `${produto.nome} (Cópia ${new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })})`,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(produtosRef, novoProduto);

    return {
      id: docRef.id, // novo id gerado pelo Firestore
      ...novoProduto,
    };
  } catch (error) {
    console.error("Erro ao duplicar produto:", error);
    throw error;
  }
}


export async function duplicarProdutosDaCategoria(idLoja, categoriaAntigaId, novaCategoriaId) {
  const produtosRef = collection(db, "clientes123pedidos", idLoja, "produtos");

  const q = query(produtosRef, where("categoriaId", "==", categoriaAntigaId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  const produtosParaDuplicar = snapshot.docs.map(doc => {
    const p = doc.data();
    return {
      ...p,
      categoriaId: novaCategoriaId,
      nome: p.nome, // mantém nome original
      // NÃO copiar id nem createdAt (serão recriados)
    };
  });

  const produtosCriados = await addProdutosBatch(idLoja, produtosParaDuplicar);
  return produtosCriados;
}

export async function addProdutosBatch(idLoja, produtos) {
  try {
    if (!produtos || produtos.length === 0) return [];

    const produtosRef = collection(
      db,
      "clientes123pedidos",
      idLoja,
      "produtos"
    );

    const produtosCriados = [];
    let total = 0;

    // Firestore limita 500 operações por batch
    for (let i = 0; i < produtos.length; i += 500) {
      const batch = writeBatch(db);
      const slice = produtos.slice(i, i + 500);

      slice.forEach((produto) => {
        const novoRef = doc(produtosRef);

        const { id, ...produtoSemId } = produto;

        const novoProduto = {
          ...produtoSemId,
          createdAt: Date.now(),
        };

        batch.set(novoRef, novoProduto);

        produtosCriados.push({
          id: novoRef.id,
          ...novoProduto,
        });

        total++; // ← faltava isso
      });
      await batch.commit();
    }

    console.log(`${total} produtos adicionados em lote`);
    return produtosCriados;
  } catch (error) {
    console.error("Erro ao adicionar produtos em lote:", error);
    throw error;
  }
}

export async function updateProduto(idLoja, idProduto, novosDados) {
  await updateDoc(doc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), idProduto), novosDados);
}

export async function deleteProduto(idLoja, idProduto) {
  await deleteDoc(doc(collection(
    db,
    "clientes123pedidos",
    idLoja,
    "produtos"
  ), idProduto));
}

export async function deleteProdutosPorCat(idLoja, categoriaId) {
  try {
    const produtosRef = collection(db, "clientes123pedidos", idLoja, "produtos");

    // busca apenas produtos da categoria (bem mais eficiente)
    const q = query(produtosRef, where("categoriaId", "==", categoriaId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return 0;

    const docs = snapshot.docs;
    let deletados = 0;

    // Firestore permite no máximo 500 operações por batch
    for (let i = 0; i < docs.length; i += 500) {
      const batch = writeBatch(db);
      const slice = docs.slice(i, i + 500);

      slice.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        deletados++;
      });

      await batch.commit();
    }

    console.log(`${deletados} produtos deletados da categoria ${categoriaId}`);
    return deletados;
  } catch (error) {
    console.error("Erro ao deletar produtos por categoria:", error);
    throw error;
  }
}
export async function updateProdutoStatusBatch(idLoja, produtos) {
  if (!produtos?.length) return;

  const batch = writeBatch(db);

  produtos.forEach((produto) => {
    batch.update(doc(collection(
      db,
      "clientes123pedidos",
      idLoja,
      "produtos"
    ), produto.id), {
      status: produto.status
    });
  });

  await batch.commit();
}
