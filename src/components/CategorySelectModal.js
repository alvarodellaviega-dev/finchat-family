// src/components/CategorySelectModal.js
export default function CategorySelectModal({
  categories,
  selectedCategory,
  onSelect,
  onClose,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>🏷️ Escolher categoria</h3>

        <div style={styles.list}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c.name);
                onClose();
              }}
              style={{
                padding: 8,
                textAlign: "left",
                background:
                  c.name === selectedCategory
                    ? "#DCF8C6"
                    : "#f2f2f2",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

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
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    maxWidth: 300,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: 260,
    overflowY: "auto",
  },
};
