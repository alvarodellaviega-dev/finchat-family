import { useState } from "react";
import { createExpense } from "../utils/createExpense";

const FAMILY_ID = "finchat-family-main";

export default function AddExpense() {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const expense = {
      description,
      value: Number(value),
      date,
      type: "debit", // ajuste se você já tem isso
    };

    try {
      await createExpense({
        familyId: FAMILY_ID,
        expense,
      });

      alert("Despesa adicionada com sucesso ✅");

      // limpa o formulário
      setDescription("");
      setValue("");
      setDate("");
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

      <button type="submit">Salvar</button>
    </form>
  );
}
