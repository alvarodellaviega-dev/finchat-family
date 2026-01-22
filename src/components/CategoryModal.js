// src/components/CategoryModal.js

function normalizeCategory(name) {
  return (name || "Outros")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function CategoryModal({
  categories = [],       // ✅ DEFENSIVO
  expenses = [],         // ✅ DEFENSIVO
  newCategory,
  setNewCategory,
  onAddCategory,
  onDeleteCategory,
  onSelectCategory,
  onClose,
}) {
  function getTotal(categoryName) {
    const key = normalizeCategory(categoryName);

    return expenses.reduce((sum, e) => {
      if (!e.createdAt?.toDate) return sum;
      if (normalizeCategory(e.category) !== key) return sum;

      // 💳 crédito parcelado
      if (e.paymentMethod === "credit" && e.installments?.value) {
        return sum + Number(e.installments.value);
      }

      // 💸 dinheiro / débito
      return sum + Math.abs(Number(e.amount) || 0);
    }, 0);
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>🗂️ Categorias</h3>

        {categories.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: 13 }}>
            Nenhuma categoria cadastrada
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} style={row}>
              <span
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => onSelectCategory(c.name)}
              >
                {c.name} — R$ {getTotal(c.name).toFixed(2)}
              </span>

              <button
                onClick={() => onDeleteCategory(c.id)}
                title="Excluir categoria"
              >
                🗑️
              </button>
            </div>
          ))
        )}

        <input
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button onClick={onAddCategory}>
          Adicionar
        </button>

        <button onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  width: "90%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
