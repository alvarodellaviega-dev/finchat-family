// src/components/EmojiPicker.js
export default function EmojiPicker({ onSelect, onClose }) {
  const EMOJIS = ["😀", "😢", "💸", "⚠️", "❤️", "🎉"];

  return (
    <div
      style={styles.overlay}
      onClick={onClose} // 🔑 clica fora = fecha
    >
      <div
        style={styles.card}
        onClick={(e) => e.stopPropagation()} // 🔑 impede fechar ao clicar dentro
      >
        <div style={styles.header}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(); // 🔑 voltar FUNCIONA
            }}
            style={styles.back}
            title="Voltar"
          >
            ←
          </button>
          <strong>Escolha um emoji</strong>
        </div>

        <div style={styles.grid}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              style={styles.emojiBtn}
              onClick={() => onSelect(e)}
            >
              {e}
            </button>
          ))}
        </div>
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
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    maxWidth: 300,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  back: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  emojiBtn: {
    fontSize: 28,
    padding: 10,
    border: "none",
    background: "#f2f2f2",
    borderRadius: 8,
    cursor: "pointer",
  },
};
