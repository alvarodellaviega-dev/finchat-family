// FinChat Family
// Component: EmojiPicker
// Scope: Picker simples de emojis (isolado)

export default function EmojiPicker({ onSelect, onClose }) {
  const EMOJIS = ["😀", "😢", "💸", "⚠️", "❤️", "🎉"];

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h3>Escolha um emoji</h3>

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

        <button onClick={onClose}>Fechar</button>
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
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 300,
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    margin: "15px 0",
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
