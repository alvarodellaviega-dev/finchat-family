export default function ChatDateSeparator({ date, formatChatDate }) {
  return (
    <div style={{
      alignSelf: "center",
      backgroundColor: "#e5e5e5",
      color: "#555",
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 10,
      margin: "10px 0",
    }}>
      {formatChatDate(date)}
    </div>
  );
}
