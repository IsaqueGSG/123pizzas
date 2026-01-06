import { useCarrinho } from "../../contexts/CarrinhoContext";
import { Link } from "react-router-dom";

const Carrinho = () => {
  const { itens, removeItem, total } = useCarrinho();

  if (itens.length === 0) {
    return <p>🛒 Carrinho vazio</p>;
  }

  return (
    <div>
      <h1>🛒 Carrinho</h1>

      {itens.map((item) => (
        <div key={item.id}>
          <strong>{item.nome}</strong>
          <p>
            {item.quantidade}x R$ {item.preco.toFixed(2)}
          </p>
          <button onClick={() => removeItem(item.id)}>Remover</button>
        </div>
      ))}

      <h2>Total: R$ {total.toFixed(2)}</h2>

      <Link to="/checkout">
        <button>Finalizar Pedido</button>
      </Link>
    </div>
  );
};

export default Carrinho;
