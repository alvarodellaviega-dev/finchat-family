// FinChat Family
// Version: 1.6.2
// File: CategoryDetailsModal.js
// Scope: Modal isolado para exibir lançamentos por categoria no mês
// ⚠️ NÃO acessa Firestore
// ⚠️ NÃO altera estado global
// ⚠️ Apenas leitura via props

import { calculateMonthlyImpact } from "../utils/calculateMonthlyImpact";

export default function CategoryDetailsModal({
  category,
  expenses,
  month,
  year,
  limits,
  onClose,
}) {
  // Filtra lançamentos da categoria no mês/ano
  const items = expenses.filter((e) => {
    if (!e.createdAt) return false;
    if (e.category !== category) return false;

    const d = e.createdAt.toDate();
    if (d.getMonth() !== month) return false;
    if (d.getFullYear() !== year) return false;

    return true;
  });

  // Total com impacto mensal (parcelamentos seguros)
  const total = items.reduce(
    (sum, e) =>
      sum + calculateMonthlyImpact(e, month, year),
    0
  );

  const absoluteTotal = Math.abs(total);
  const limit = limits?.[category];

  const isExceeded = limit && absoluteTotal > limit;
  const isWarning =
    limit && absoluteTotal >= limit * 0.8 && !isExceeded;

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

        {/* ALERTA DE LIMITE */}
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
              R$ {absoluteTotal.toFixed(2)} / R$ {limit.toFixed(2)}
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
                {Math.abs(
                  calculateMonthlyImpact(e, month, year)
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div style={styles.total}>
          Total do mês:{" "}
          <strong>
            R$ {absoluteTotal.toFixed(2)}
          </strong>
        </div>

        {/* AÇÕES */}
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
