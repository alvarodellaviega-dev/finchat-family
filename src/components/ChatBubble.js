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
        maxWidth: "75%",
        padding: "8px 12px",
        borderRadius: 14,
        background: isMe ? "#DCF8C6" : "#FFFFFF",
        alignSelf: isMe ? "flex-end" : "flex-start",
        borderTopRightRadius: isMe ? 4 : 14,
        borderTopLeftRadius: isMe ? 14 : 4,
        position: "relative",
        boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
        wordBreak: "break-word",
      }}
    >
      {/* 😊 EMOJI */}
      {e.type === "emoji" ? (
        <div style={{ fontSize: 28 }}>{e.emoji}</div>
      ) : (
        <>
          {/* 🏷️ CATEGORIA */}
          {e.category && (
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginBottom: 2,
              }}
            >
              {e.category}
            </div>
          )}

          {/* 📝 TEXTO */}
          <div>{e.text}</div>

          {/* 💰 VALOR */}
          {typeof e.amount === "number" && (
            <strong>
              R$ {Math.abs(e.amount).toFixed(2)}
            </strong>
          )}

          {/* ⏰ HORA */}
          {e.createdAt?.toDate && (
            <div
              style={{
                fontSize: 11,
                color: "#777",
                textAlign: "right",
                marginTop: 2,
              }}
            >
              {formatTime(e.createdAt.toDate())}
            </div>
          )}

          {/* 💳 CARTÃO */}
          {(e.paymentMethod === "credit" ||
            e.paymentMethod === "debit") &&
            e.cardId && (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                💳{" "}
                {cards.find(c => c.id === e.cardId)?.name ||
                  "Cartão"}
              </div>
            )}

          {/* 📆 PARCELAMENTO */}
          {e.installments && (
            <InstallmentBubble expense={e} />
          )}

          {/* ✏️ EDITAR */}
          <button
            style={{
              position: "absolute",
              bottom: 4,
              right: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={() => setEditExpense(e)}
          >
            ✏️
          </button>
        </>
      )}
    </div>
  );
}
