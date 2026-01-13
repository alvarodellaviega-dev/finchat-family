import { useState } from "react";
import { createExpense } from "../utils/createExpense";
import { TRANSACTION_TYPES } from "../types/transaction";

const FAMILY_ID = "finchat-family-main";

export default function AddCreditCardPayment() {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [cardId, setCardId] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cardId) {
      alert("Selecione o cartão");
      return;
    }

    const transaction = {
      type: TRANSACTION_TYPES.CREDIT_PAYMENT,
      amount: Number(amount),
      date,
      cardId,
      categoryId: "pagamento-cartao"
    };

    try {
      await createExpense({
        familyId: FAMILY_ID,
        expense: transaction
      });

      alert("Pagamento do cartão registrado ✅");

      setAmount("");
      setDate("");
      setCardId("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Pagar cartão de crédito</h3>

      <input
        type="number"
        placeholder="Valor pago"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {/* Pode reutilizar o CardSelector */}
      {/* <CardSelector value={cardId} onChange={setCardId} /> */}

      <button type="submit">Registrar pagamento</button>
    </form>
  );
}
