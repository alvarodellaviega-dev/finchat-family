// src/components/EditExpenseModal.js
import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function EditExpenseModal({
  expense,
  FAMILY_ID,
  categories,
  onClose,
}) {
  // ✅ Hooks SEMPRE no topo
  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");

  // ✅ Sincroniza quando abrir
  useEffect(() => {
    if (!expense) return;

    setText(expense.text || "");
    setAmount(Math.abs(expense.amount || 0));
    setCategory(expense.category || "");
  }, [expense]);

  // 🔒 Proteção só DEPOIS dos hooks
  if (!expense) return null;

  async function save() {
    if (!text.trim()) return;

    const value =
      expense.type === "expense"
        ? -Math.abs(amount)
        : Math.abs(amount);

    await updateDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id),
      {
        text,
        amount: value,
        category:
          expense.type === "expense"
            ? category || null
            : null,
      }
    );

    onClose();
  }

  async function remove() {
    if (!window.confirm("Excluir lançamento?")) return;

    await deleteDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id)
    );

    onClose();
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>✏️ Editar lançamento</h3>

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

        {/* ✅ SELECT DE CATEGORIA — AGORA FUNCIONA */}
        {expense.type === "expense" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Selecione a categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <div style={styles.actions}>
          <button onClick={save}>Salvar</button>
          <button onClick={remove} style={styles.danger}>
            Excluir
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */
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
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  danger: {
    background: "#e53935",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },
};

