// FinChat Family
// File: EditExpenseModal.js
// Version: 1.6.3-stable-final
// Status: BLINDADO • hooks OK • categories safe • produção

import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function EditExpenseModal({
  expense,
  FAMILY_ID,
  categories = [], // 🔒 default seguro
  onClose,
}) {
  /* ================= HOOKS (SEMPRE PRIMEIRO) ================= */

  const safeCategories = Array.isArray(categories) ? categories : [];

  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Outros");

  /* ================= SYNC COM EXPENSE ================= */

  useEffect(() => {
    if (!expense) return;

    setText(expense.text || "");
    setAmount(Math.abs(Number(expense.amount || 0)));
    setCategory(expense.category || "Outros");
  }, [expense]);

  /* ================= GUARD RENDER ================= */

  if (!expense) return null;

  /* ================= ACTIONS ================= */

  async function handleSave() {
    if (!text.trim() || !amount) return;

    await updateDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id),
      {
        text: text.trim(),
        amount:
          expense.type === "income"
            ? Math.abs(amount)
            : -Math.abs(amount),
        category:
          expense.type === "income" ? null : category,
      }
    );

    onClose();
  }

  async function handleDelete() {
    if (!window.confirm("Excluir este lançamento?")) return;

    await deleteDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id)
    );

    onClose();
  }

  /* ================= UI ================= */

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Editar lançamento</h3>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descrição"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
        />

        {/* CATEGORIA — SOMENTE SAÍDA */}
        {expense.type !== "income" && (
          <>
            {safeCategories.length === 0 ? (
              <div style={styles.warning}>
                Nenhuma categoria disponível
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {safeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <div style={styles.actions}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={handleDelete} style={styles.delete}>
            Excluir
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
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
    justifyContent: "space-between",
    gap: 8,
  },

  delete: {
    background: "#e53935",
    color: "#fff",
    border: "none",
  },

  warning: {
    fontSize: 13,
    color: "#8a6d00",
    background: "#fff3cd",
    padding: 6,
    borderRadius: 6,
  },
};
