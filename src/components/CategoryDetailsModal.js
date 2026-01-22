// src/components/CategoryDetailsModal.js

function normalizeCategory(name) {
  return (name || "Outros")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function CategoryDetailsModal({
  category,
  expenses,
  month,
  year,
  onClose,
}) {
  const target = normalizeCategory(category);

  const items = expenses.filter((e) => {
    if (!e.createdAt?.toDate) return false;

    const expenseCategory = normalizeCategory(e.category);
    if (expenseCategory !== target) return false;

    const d = e.createdAt.toDate();
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // ✅ TOTAL CORRETO (dinheiro + débito + crédito parcelado)
  const total = items.reduce((sum, e) => {
    // 💳 crédito parcelado
    if (e.paymentMethod === "credit" && e.installments?.value) {
      return sum + Number(e.installments.value);
    }

    // 💸 dinheiro / 💳 débito
    return sum + Math.abs(Number(e.amount) || 0);
  }, 0);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>📂 {category}</h3>

        <div style={styles.list}>
          {items.length === 0 && (
            <p style={{ opacity: 0.7 }}>
              Nenhum lançamento nesta categoria.
            </p>
          )}

          {items.map((e) => (
            <div key={e.id} style={styles.item}>
              <div>
                <div>{e.text}</div>

                {e.paymentMethod === "credit" && e.installments && (
                  <div style={styles.installment}>
                    💳 {e.installments.total}x de R${" "}
                    {e.installments.value.toFixed(2)}
                  </div>
                )}
              </div>

              <strong>
                R${" "}
                {(
                  e.paymentMethod === "credit" && e.installments?.value
                    ? e.installments.value
                    : Math.abs(Number(e.amount) || 0)
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div style={styles.total}>
          Total do mês:{" "}
          <strong>R$ {total.toFixed(2)}</strong>
        </div>

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
    gap: 12,
  },
  list: {
    maxHeight: 260,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #eee",
    paddingBottom: 6,
    fontSize: 14,
    gap: 10,
  },
  installment: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  total: {
    borderTop: "1px solid #ddd",
    paddingTop: 8,
    fontSize: 15,
  },
};
