import STICKERS from "../Sticker/Sticker";

export default function StickerPicker({ onSelect, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Figurinhas</h3>

        <div style={styles.grid}>
          {STICKERS.map((s) => (
            <button
              key={s.id}
              style={styles.stickerBtn}
              onClick={() => onSelect(s)}
            >
              <img src={s.src} alt={s.label} style={styles.img} />
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
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  stickerBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  img: {
    width: 64,
    height: 64,
  },
};
