// FinChat Family
// Version: 1.7.1
// File: CategoryDetailsModal.js
// Scope: Modal isolado para exibir lançamentos por categoria no mês
// ⚠️ NÃO acessa Firestore
// ⚠️ NÃO altera estado global
// ⚠️ Compatível com dados antigos e novos

/* ================= UTIL ================= */

function normalizeCategory(name) {
  return (name || "Outros")
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

export default function CategoryDetailsModal({
  category,
  expenses,
  month,
  year,
  limits,
  onClose,
}) {
  const targetCategory = normalizeCategory(category);

  const items = expenses.filter((e) => {
    if (!e.createdAt?.toDate) return false;

    // ❌ nunca entradas
    if (e.type === "income" || e.paymentMethod === "income")
      return false;

    const expenseCategory = normalizeCategory(e.category);
    if (expenseCategory !== targetCategory)
      return false;

    // 💳 crédito
    if (e.paymentMethod === "credit" && e.installments) {
      const start = new Date(
        e.installments.startYear,
        e.installments.startMonth,
        1
      );

      const current = diffMonths(
        start,
        new Date(year, month, 1)
      ) + 1;

      return (
        current >= 1 &&
        current <= e.installments.total
      );
    }

    // 💸 débito / dinheiro
    const d = e.createdAt.toDate();
    return (
      d.getMonth() === month &&
      d.getFullYear() === year
    );
  });

  const total = items.reduce((sum, e) => {
    if (
      e.paymentMethod === "credit" &&
      e.installments?.value
    ) {
      return sum + Number(e.installments.value);
    }

    return sum + Math.abs(Number(e.amount) || 0);
  }, 0);

  const limit = limits?.[category];
  const isExceeded = limit && total > limit;
  const isWarning =
    limit && total >= limit * 0.8 && !isExceeded;

  const monthLabel = String(month + 1).padStart(2, "0");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <strong>🗂️ {category}</strong>
          <span>
            {monthLabel}/{year}
          </span>
        </div>

        {/* ALERTA */}
        {limit && (
          <div
            style={{
              ...styles.alert,
              ...(isExceeded
                ? styles.alertDanger
                : isWarning
                ? styles.alertWarning
                : styles.alertOk),
            }}
          >
            {isExceeded
              ? "🚨 Limite estourado"
              : isWarning
              ? "⚠️ Atenção: perto do limite"
              : "✅ Dentro do limite"}

            <div style={styles.alertSub}>
              R$ {total.toFixed(2)} / R$ {limit.toFixed(2)}
            </div>
          </div>
        )}

        {/* LISTA */}
        <div style={styles.list}>
          {items.length === 0 && (
            <p style={styles.empty}>
              Nenhum lançamento nesta categoria.
            </p>
          )}

          {items.map((e) => (
            <div key={e.id} style={styles.item}>
              <span>{e.text}</span>
              <strong>
                R${" "}
                {e.paymentMethod === "credit"
                  ? Number(
                      e.installments?.value || 0
                    ).toFixed(2)
                  : Math.abs(
                      Number(e.amount) || 0
                    ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div style={styles.total}>
          Total do mês:{" "}
          <strong>R$ {total.toFixed(2)}</strong>
        </div>

        <button style={styles.close} onClick={onClose}>
          Fechar
        </button>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alert: {
    padding: 10,
    borderRadius: 8,
    fontWeight: "bold",
  },
  alertSub: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "normal",
  },
  alertOk: {
    background: "#e6f7ee",
    color: "#1b7f4b",
  },
  alertWarning: {
    background: "#fff7e6",
    color: "#9a6b00",
  },
  alertDanger: {
    background: "#fdecea",
    color: "#b00020",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: 260,
    overflowY: "auto",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    borderBottom: "1px solid #eee",
    paddingBottom: 4,
  },
  empty: {
    fontSize: 14,
    color: "#777",
  },
  total: {
    borderTop: "1px solid #ddd",
    paddingTop: 8,
    fontSize: 15,
  },
  close: {
    marginTop: 6,
    background: "#25D366",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
  },
};
