import { useState } from "react";
import { v4 as uuid } from "uuid";
import { createExpense } from "../utils/createExpense";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CardSelector } from "./CardSelector";
import { PAYMENT_METHODS } from "../types/transaction";

const FAMILY_ID = "finchat-family-main";

export default function AddExpense() {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState();
  const [cardId, setCardId] = useState();
  const [installmentTotal, setInstallmentTotal] = useState(1);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Selecione o meio de pagamento");
      return;
    }

    if (paymentMethod === PAYMENT_METHODS.CREDIT && !cardId) {
      alert("Selecione o cartão de crédito");
      return;
    }

    const totalValue = Number(value);
    const installments = installmentTotal || 1;
    const baseAmount = Math.round((totalValue / installments) * 100) / 100;
    const groupId = installments > 1 ? uuid() : undefined;

    const expensesToSave = [];

    for (let i = 0; i < installments; i++) {
      const installmentDate = new Date(date);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      expensesToSave.push({
        description,
        amount: baseAmount,
        date: installmentDate,
        type: "expense",
        paymentMethod,
        cardId:
          paymentMethod === PAYMENT_METHODS.CREDIT
            ? cardId
            : undefined,
        installments:
          installments > 1
            ? {
                total: installments,
                index: i + 1,
                groupId,
              }
            : undefined,
      });
    }

    try {
      for (const expense of expensesToSave) {
        await createExpense({
          familyId: FAMILY_ID,
          expense,
        });
      }

      alert("Despesa adicionada com sucesso ✅");

      // limpa o formulário
      setDescription("");
      setValue("");
      setDate("");
      setPaymentMethod(undefined);
      setCardId(undefined);
      setInstallmentTotal(1);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h3>Adicionar despesa</h3>

      <input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Valor"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {/* PASSO 1 — pagamento */}
      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
      />

      {/* PASSO 2 — cartão */}
      {paymentMethod === PAYMENT_METHODS.CREDIT && (
        <>
          <CardSelector value={cardId} onChange={setCardId} />

          {/* PASSO 5 — parcelas */}
          <label>Parcelas</label>
          <input
            type="number"
            min={1}
            value={installmentTotal}
            onChange={(e) =>
              setInstallmentTotal(Number(e.target.value))
            }
          />
        </>
      )}

      <button type="submit">Salvar</button>
    </form>
  );
}

