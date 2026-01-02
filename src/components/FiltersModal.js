// src/components/FiltersModal.js
export default function FiltersModal({
  month,
  setMonth,
  year,
  setYear,
  MONTHS,
  typeFilter,
  setTypeFilter,
  onClose,
}) {

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <h3>🔍 Filtros</h3>

        <div style={styles.filterRow}>
          <button onClick={() => setMonth((m) => (m + 11) % 12)}>◀</button>
          <strong>{MONTHS[month]}</strong>
          <button onClick={() => setMonth((m) => (m + 1) % 12)}>▶</button>

          <button onClick={() => setYear((y) => y - 1)}>◀</button>
          <strong>{year}</strong>
          <button onClick={() => setYear((y) => y + 1)}>▶</button>
          <div style={{ marginTop: 12 }}>
  <strong>Tipo</strong>

  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
    <button
      onClick={() => setTypeFilter("all")}
      style={{
        padding: 6,
        background: typeFilter === "all" ? "#25D366" : "#eee",
      }}
    >
      Todos
    </button>

    <button
      onClick={() => setTypeFilter("income")}
      style={{
        padding: 6,
        background: typeFilter === "income" ? "#25D366" : "#eee",
      }}
    >
      Entradas
    </button>

    <button
      onClick={() => setTypeFilter("expense")}
      style={{
        padding: 6,
        background: typeFilter === "expense" ? "#25D366" : "#eee",
      }}
    >
      Saídas
    </button>
  </div>
</div>

        </div>

        <button onClick={onClose}>Aplicar filtros</button>
      </div>
    </div>
  );
}

/* ===== styles locais ===== */
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
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
};
