import ChatBubble from "./ChatBubble";

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function formatDateLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Hoje";
  if (isSameDay(date, yesterday)) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatList({
  expenses,
  user,
  bottomRef,
  setEditExpense,   // 🔑 nome correto
  cards,
}) {
  let lastDate = null;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {expenses.map((e) => {
        const date = e.createdAt?.toDate?.() || new Date();
        const showDate = !lastDate || !isSameDay(date, lastDate);
        if (showDate) lastDate = date;

        return (
          <div key={e.id}>
            {showDate && (
              <div
                style={{
                  textAlign: "center",
                  margin: "12px 0 6px",
                  fontSize: 12,
                  color: "#666",
                }}
              >
                {formatDateLabel(date)}
              </div>
            )}

            <ChatBubble
              e={e}
              user={user}
              cards={cards}
              formatTime={formatTime}
              setEditExpense={setEditExpense}  // 🔥 AGORA FUNCIONA
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
