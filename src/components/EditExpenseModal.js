// src/components/EditExpenseModal.js
import { useState, useEffect } from "react";

export default function EditExpenseModal({
  expense,
  onClose,
  onSave,
  onDelete,
}) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");

  useEffect(() => {
    if (!expense) return;

    setText(expense.text || "");
    setAmount(
      expense.amount != null
        ? Math.abs(expense.amount).toString()
        : ""
    );
    setCategory(expense.category || "Outros");
  }, [expense]);

  if (!expense) return null;

  function handleSubmit(e) {
    e.preventDefault();

    onSave(expense.id, {
      text: text.trim(),
      amount:
        expense.amount < 0
          ? -Math.abs(Number(amount))
          : Math.abs(Number(amount)),
      category,
    });
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>✏️ Editar lançamento</h3>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descrição"
          />

          <input
            style={styles.input}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor"
          />

          <select
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Mercado</option>
            <option>Alimentação</option>
            <option>Transporte</option>
            <option>Combustível</option>
            <option>Saúde</option>
            <option>Lazer</option>
            <option>Outros</option>
          </select>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancel}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              style={styles.delete}
              onClick={() => {
                if (window.confirm("Excluir este lançamento?")) {
                  onDelete(expense.id);
                }
              }}
            >
              Excluir
            </button>

            <button type="submit" style={styles.save}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    maxWidth: 320,
  },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  cancel: {
    background: "#eee",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },
  delete: {
    background: "#ff5252",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },
  save: {
    background: "#25D366",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
  },
};
