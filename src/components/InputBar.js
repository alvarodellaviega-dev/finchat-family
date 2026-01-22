import { useEffect } from "react";

export default function InputBar({
  text,
  setText,
  onSend,
  onEmoji,
  paymentMethod,
  setPaymentMethod,
  cards,
  selectedCardId,
  setSelectedCardId,
}) {
  const isIncome =
    /ganhei|recebi|achei|fiz|salario|pagamento/i.test(text);

  const showPaymentBar = text.trim() && !isIncome;

  const needsCard =
    showPaymentBar &&
    (paymentMethod === "debit" || paymentMethod === "credit");

  // 🔒 reset automático ao virar entrada
  useEffect(() => {
    if (isIncome) {
      setPaymentMethod("cash");
      setSelectedCardId(null);
    }
  }, [isIncome, setPaymentMethod, setSelectedCardId]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: 8,
        borderTop: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      {/* INPUT */}
      <div style={{ display: "flex", gap: 8 }}>
        <span
          onClick={onEmoji}
          style={{ fontSize: 22, cursor: "pointer" }}
        >
          😊
        </span>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Paguei mercado 120 | Recebi salário 3000"
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button type="submit">➤</button>
      </div>

      {/* 💳 PAGAMENTO — SOMENTE SAÍDA */}
      {showPaymentBar && (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              style={btn(paymentMethod === "cash")}
            >
              💸 Dinheiro
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("debit")}
              style={btn(paymentMethod === "debit")}
            >
              💳 Débito
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("credit")}
              style={btn(paymentMethod === "credit")}
            >
              💳 Crédito
            </button>
          </div>

          {needsCard && (
            <select
              value={selectedCardId || ""}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              <option value="">Selecione o cartão</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </form>
  );
}

function btn(active) {
  return {
    padding: "4px 8px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: active ? "#25D366" : "#eee",
    color: active ? "#fff" : "#000",
  };
}
