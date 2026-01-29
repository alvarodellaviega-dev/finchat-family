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
          padding: "8px 12px",
          borderRadius: 12,
          background: isMe ? "#DCF8C6" : "#fff",
          borderTopRightRadius: isMe ? 4 : 12,
          borderTopLeftRadius: isMe ? 12 : 4,
          boxShadow: "0 1px 1px rgba(0,0,0,0.15)",
          fontSize: 14,
          position: "relative", // 🔑 necessário pro botão
        }}
      >
        {/* ✏️ BOTÃO EDITAR */}
        {e.type !== "emoji" && (
          <span
            onClick={() => setEditExpense(e)}
            style={{
              position: "absolute",
              top: 4,
              right: 6,
              fontSize: 12,
              cursor: "pointer",
              opacity: 0.6,
            }}
          >
            ✏️
          </span>
        )}

        {/* 🏷 CATEGORIA */}
        {e.category && (
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>
            {e.category}
          </div>
        )}

        {e.type === "emoji" ? (
          <div style={{ fontSize: 30 }}>{e.emoji}</div>
        ) : (
          <>
            {/* TEXTO */}
            <div>{e.text}</div>

            {/* VALOR */}
            {typeof e.amount === "number" && e.amount !== 0 && (
              <strong style={{ display: "block", marginTop: 2 }}>
                R$ {Math.abs(e.amount).toFixed(2)}
              </strong>
            )}

            {/* PARCELAMENTO */}
            {e.installments && <InstallmentBubble expense={e} />}

            {/* HORA */}
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
          </>
        )}
      </div>
    </div>
  );
}
