import React from "react";

export default function PaymentBar({
  visible,
  paymentMethod,
  setPaymentMethod,
}) {
  if (!visible) return null;

  return (
    <div style={styles.bar}>
      <button
        type="button"
        style={{
          ...styles.button,
          background: paymentMethod === "cash" ? "#c8e6c9" : "#fff",
        }}
        onClick={() => setPaymentMethod("cash")}
      >
        💼 Carteira
      </button>

      <button
        type="button"
        style={{
          ...styles.button,
          background: paymentMethod === "debit" ? "#bbdefb" : "#fff",
        }}
        onClick={() => setPaymentMethod("debit")}
      >
        💳 Débito
      </button>

      <button
        type="button"
        style={{
          ...styles.button,
          background: paymentMethod === "credit" ? "#e1bee7" : "#fff",
        }}
        onClick={() => setPaymentMethod("credit")}
      >
        💳 Crédito
      </button>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    gap: 6,
    padding: "6px 8px",
    borderTop: "1px solid #ddd",
    background: "#fafafa",
  },
  button: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "6px 0",
    fontSize: 13,
    cursor: "pointer",
  },
};
