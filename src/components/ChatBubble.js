import InstallmentBubble from "./InstallmentBubble";

export default function ChatBubble({
  e,
  user,
  cards,
  formatTime,
  setEditExpense,
}) {
  const isMe = e.user === user.email;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "6px 10px",
          borderRadius: 12,
          background: isMe ? "#DCF8C6" : "#fff",
          borderTopRightRadius: isMe ? 4 : 12,
          borderTopLeftRadius: isMe ? 12 : 4,
          boxShadow: "0 1px 1px rgba(0,0,0,0.15)",
          fontSize: 14,
          position: "relative",
        }}
      >
        {e.type === "emoji" ? (
          <div style={{ fontSize: 30 }}>{e.emoji}</div>
        ) : (
          <>
            <div>{e.text}</div>

            {typeof e.amount === "number" && (
              <strong style={{ display: "block", marginTop: 2 }}>
                R$ {Math.abs(e.amount).toFixed(2)}
              </strong>
            )}

            {e.installments && (
              <InstallmentBubble expense={e} />
            )}

            {e.createdAt?.toDate && (
              <div
                style={{
                  fontSize: 11,
                  textAlign: "right",
                  opacity: 0.6,
                  marginTop: 4,
                }}
              >
                {formatTime(e.createdAt.toDate())}
              </div>
            )}

            <button
              onClick={() => setEditExpense(e)}
              style={{
                position: "absolute",
                bottom: 2,
                right: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              ✏️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
