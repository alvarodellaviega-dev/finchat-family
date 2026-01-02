// src/components/EditExpenseModal.js
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function EditExpenseModal({
  expense,
  FAMILY_ID,
  onClose,
}) {
  const [text, setText] = useState(expense.text);
  const [amount, setAmount] = useState(Math.abs(expense.amount));

  async function save() {
    if (!text.trim()) return;

    const value = expense.amount < 0 ? -Math.abs(amount) : Math.abs(amount);

    await updateDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id),
      {
        text,
        amount: value,
      }
    );

    onClose();
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <h3>✏️ Editar gasto</h3>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descrição"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={save}>Salvar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

/* ===== styles locais ===== */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
