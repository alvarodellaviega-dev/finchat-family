export default function PaymentBar({
  visible,
  paymentMethod,
  setPaymentMethod,
  selectedCardId,
  setSelectedCardId,
  cards = [],
  styles,
}) {
  if (!visible) return null;

  return (
    <div style={styles.paymentBar}>
      {/* 💼 Carteira */}
      <button
        type="button"
        onClick={() => {
          setPaymentMethod("cash");
          setSelectedCardId(null);
        }}
        style={{
          ...styles.paymentButton,
          background: paymentMethod === "cash" ? "#c8e6c9" : "#eee",
        }}
      >
        💼 Carteira
      </button>

      {/* 💳 Débito */}
      <button
        type="button"
        onClick={() => {
          setPaymentMethod("debit");
          setSelectedCardId(null);
        }}
        style={{
          ...styles.paymentButton,
          background: paymentMethod === "debit" ? "#bbdefb" : "#eee",
        }}
      >
        💳 Débito
      </button>

      {/* 🟣 Crédito */}
      <button
        type="button"
        onClick={() => {
          setPaymentMethod("credit");
          setSelectedCardId(null);
        }}
        style={{
          ...styles.paymentButton,
          background: paymentMethod === "credit" ? "#e1bee7" : "#eee",
        }}
      >
        🟣 Crédito
      </button>

      {/* 🔐 SELECT DE CARTÃO — DÉBITO E CRÉDITO */}
      {(paymentMethod === "debit" || paymentMethod === "credit") && (
        <select
          value={selectedCardId || ""}
          onChange={(e) => setSelectedCardId(e.target.value || null)}
          style={{
            marginLeft: 8,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
          }}
        >
          <option value="">Selecione o cartão</option>

          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
