// src/components/FiltersModal.js

export default function FiltersModal({
  month,
  setMonth,
  year,
  setYear,
  MONTHS,

  typeFilter,
  setTypeFilter,

  categoryFilter,
  setCategoryFilter,
  categories = [], // ✅ DEFENSIVO

  paymentFilter,
  setPaymentFilter,

  onClose,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>🔍 Filtros</h3>

        {/* PERÍODO */}
        <div style={styles.block}>
          <strong>Período</strong>

          <div style={styles.row}>
            <button onClick={() => setMonth((m) => (m + 11) % 12)}>◀</button>
            <span>{MONTHS[month]}</span>
            <button onClick={() => setMonth((m) => (m + 1) % 12)}>▶</button>
          </div>

          <div style={styles.row}>
            <button onClick={() => setYear((y) => y - 1)}>◀</button>
            <span>{year}</span>
            <button onClick={() => setYear((y) => y + 1)}>▶</button>
          </div>
        </div>

        {/* TIPO */}
        <div style={styles.block}>
          <strong>Tipo</strong>
          <div style={styles.row}>
            {["all", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  ...styles.chip,
                  background: typeFilter === t ? "#25D366" : "#eee",
                  color: typeFilter === t ? "#fff" : "#000",
                }}
              >
                {t === "all"
                  ? "Todos"
                  : t === "income"
                  ? "Entradas"
                  : "Saídas"}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORIA */}
        <div style={styles.block}>
          <strong>Categoria</strong>
          <select
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas</option>

            {categories.length === 0 ? (
              <option disabled>Sem categorias</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* PAGAMENTO */}
        <div style={styles.block}>
          <strong>Pagamento</strong>
          <select
            value={paymentFilter || ""}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="cash">Dinheiro</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>
        </div>

        <button style={styles.apply} onClick={onClose}>
          Aplicar filtros
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

  block: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  chip: {
    padding: "6px 10px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
  },

  apply: {
    marginTop: 10,
    background: "#25D366",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
  },
};
