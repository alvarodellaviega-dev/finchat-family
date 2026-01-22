// src/components/InputBar.js
export default function InputBar({
  text,
  setText,
  onSend,
  onEmoji,
}) {
  return (
    <form onSubmit={onSend} style={{ display: "flex", padding: 8 }}>
      <span onClick={onEmoji} style={{ fontSize: 22, cursor: "pointer" }}>
        😊
      </span>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ flex: 1, margin: "0 8px" }}
        placeholder="Digite..."
      />

      <button type="submit">➤</button>
    </form>
  );
}
