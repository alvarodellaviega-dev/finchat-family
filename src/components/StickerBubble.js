export default function StickerBubble({ sticker, isMine }) {
  return (
    <div
      style={{
        ...styles.bubble,
        alignSelf: isMine ? "flex-end" : "flex-start",
      }}
    >
      <img src={sticker.src} alt="" style={styles.img} />
    </div>
  );
}

const styles = {
  bubble: {
    maxWidth: "70%",
    padding: 6,
    borderRadius: 14,
    background: "#fff",
  },
  img: {
    width: 120,
    height: 120,
  },
};
