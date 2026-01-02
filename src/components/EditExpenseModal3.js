import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export default function EditExpenseModal({
  expense,
  onClose,
}) {
  if (!expense) return null;

  async function handleSave() {
    await updateDoc(
      doc(db, "families", FAMILY_ID, "expenses", expense.id),
      {
        text: expense.text,
        amount: expense.amount,
        category: expense.category,
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          width: "90%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3>Editar lançamento</h3>

        <input
          value={expense.text}
          onChange={(e) =>
            (expense.text = e.target.value)
          }
          placeholder="Descrição"
        />

        <input
          type="number"
          value={expense.amount}
          onChange={(e) =>
            (expense.amount = Number(e.target.value))
          }
          placeholder="Valor"
        />

        <input
          value={expense.category || ""}
          onChange={(e) =>
            (expense.category = e.target.value)
          }
          placeholder="Categoria"
        />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={handleDelete}>Excluir</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
