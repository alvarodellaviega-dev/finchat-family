import { calculateMonthlyImpact } from "../utils/calculateMonthlyImpact";

function normalize(text) {
  return text
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CategoryDetailsModal({
  category,
  expenses,
  month,
  year,
  limits,
  onClose,
}) {
  const normalizedCategory = normalize(category);

  const items = expenses
    .filter((e) => {
      if (!e.createdAt || !e.createdAt.toDate) return false;
      if (typeof e.amount !== "number") return false;
      if (e.amount >= 0) return false; // 👈 somente SAÍDAS
      if (!e.category) return false;

      const d = e.createdAt.toDate();
      if (d.getMonth() !== month) return false;
      if (d.getFullYear() !== year) return false;

      return normalize(e.category) === normalizedCategory;
    })
    .sort(
      (a, b) =>
        a.createdAt.toDate() - b.createdAt.toDate()
    );

  const total = items.reduce(
    (sum, e) =>
      sum + Math.abs(calculateMonthlyImpact(e, month, year)),
    0
  );

  const limit = Object.entries(limits || {}).find(
  ([key]) => normalize(key) === normalizedCategory
)?.[1];

  const isExceeded = limit && total > limit;
  const isWarning =
    limit && total >= limit * 0.8 && !isExceeded;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <strong>{category}</strong>
          <span>
            {String(month + 1).padStart(2, "0")}/{year}
          </span>
        </div>

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
              ? "⚠️ Perto do limite"
              : "✅ Dentro do limite"}

            <div style={styles.alertSub}>
              R$ {total.toFixed(2)} / R$ {limit.toFixed(2)}
            </div>
          </div>
        )}

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
                R$ {Math.abs(e.amount).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div style={styles.total}>
          Total do mês: <strong>R$ {total.toFixed(2)}</strong>
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
