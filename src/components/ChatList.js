// src/components/ChatList.js
import InstallmentBubble from "./InstallmentBubble";

export default function ChatList({
  expenses,
  user,
  bottomRef,
  onEdit, // 🔴 recebe do Home
}) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
      {expenses.map(e => (
        <div
          key={e.id}
          style={{
            background: e.user === user.email ? "#DCF8C6" : "#fff",
            padding: 8,
            borderRadius: 12,
            marginBottom: 6,
            maxWidth: "75%",
            alignSelf: e.user === user.email ? "flex-end" : "flex-start",
            position: "relative",
          }}
        >
          {e.type === "emoji" ? (
            <span style={{ fontSize: 28 }}>{e.emoji}</span>
          ) : (
            <>
              <div>{e.text}</div>
              <strong>R$ {Math.abs(e.amount || 0).toFixed(2)}</strong>

              {e.installments && <InstallmentBubble expense={e} />}

              {/* ✏️ EDITAR */}
              <button
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 6,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onClick={() => onEdit(e)}
              >
                ✏️
              </button>
            </>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
