import { useState } from "react";
import { useCarrinho } from "../../contexts/CarrinhoContext";

const Checkout = () => {
  const { itens, total, clear } = useCarrinho();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const finalizar = () => {
    const pedido = {
      cliente: { nome, telefone },
      itens,
      total,
      status: "novo",
      createdAt: new Date(),
    };

    console.log("Pedido enviado:", pedido);

    clear();
    alert("Pedido realizado com sucesso!");
  };

  return (
    <div>
      <h1>✅ Finalizar Pedido</h1>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />

      <h2>Total: R$ {total.toFixed(2)}</h2>

      <button onClick={finalizar}>Enviar Pedido</button>
    </div>
  );
};

export default Checkout;
