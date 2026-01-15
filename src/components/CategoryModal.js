import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

/* ================= UTIL ================= */

function normalizeCategory(name) {
  return (name || "Outros")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/–/g, "-")
    .trim();
}

function diffMonths(from, to) {
  return (
    to.getFullYear() * 12 +
    to.getMonth() -
    (from.getFullYear() * 12 + from.getMonth())
  );
}

/* ================= COMPONENT ================= */

export default function CategoryModal({
  db,
  FAMILY_ID,
  categories,
  expenses,
  newCategory,
  setNewCategory,
  onClose,
  onSelectCategory,
}) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  /* ================= TOTAL POR CATEGORIA ================= */

  function getCategoryTotal(categoryName) {
    const target = normalizeCategory(categoryName);

    return expenses.reduce((sum, e) => {
      if (!e.createdAt?.toDate) return sum;

      // ❌ nunca entradas
      if (e.type === "income" || e.paymentMethod === "income") {
        return sum;
      }

      const expenseCategory = normalizeCategory(e.category);
      if (expenseCategory !== target) return sum;

      // 💳 crédito (à vista ou parcelado)
      if (e.paymentMethod === "credit" && e.installments) {
        const start = new Date(
          e.installments.startYear,
          e.installments.startMonth,
          1
        );

        const current =
          diffMonths(start, new Date(year, month, 1)) + 1;

        if (
          current >= 1 &&
          current <= e.installments.total
        ) {
          return sum + Number(e.installments.value || 0);
        }

        return sum;
      }

      // 💸 débito / dinheiro
      const d = e.createdAt.toDate();
      if (
        d.getMonth() !== month ||
        d.getFullYear() !== year
      ) {
        return sum;
      }

      return sum + Math.abs(Number(e.amount) || 0);
    }, 0);
  }

  /* ================= UI ================= */

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <h3>📂 Categorias (mês atual)</h3>

        {categories.map((c) => {
          const total = getCategoryTotal(c.name);

          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => onSelectCategory(c.name)}
              >
                {c.name} — R$ {total.toFixed(2)}
              </span>

              <button
                onClick={async () => {
                  const used = expenses.some(
                    (e) =>
                      normalizeCategory(e.category) ===
                      normalizeCategory(c.name)
                  );

                  if (
                    used &&
                    !window.confirm(
                      "Essa categoria já foi usada. Deseja excluir mesmo assim?"
                    )
                  ) {
                    return;
                  }

                  await deleteDoc(
                    doc(db, "families", FAMILY_ID, "categories", c.id)
                  );
                }}
              >
                🗑️
              </button>
            </div>
          );
        })}

        <input
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button
          onClick={async () => {
            if (!newCategory.trim()) return;

            await addDoc(
              collection(db, "families", FAMILY_ID, "categories"),
              { name: newCategory.trim() }
            );

            setNewCategory("");
          }}
        >
          Adicionar
        </button>

        <button onClick={onClose}>Fechar</button>
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
    zIndex: 9999,
  },
  modalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
