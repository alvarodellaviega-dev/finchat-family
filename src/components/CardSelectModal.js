import React from "react";

export default function CardSelectModal({
  cards,
  paymentMethod, // "debit" | "credit"
  onSelect,
  onCancel,
}) {
  const compatibleCards = cards.filter((c) => {
    if (!c.ativo) return false;

    // 🔁 CARTÕES ANTIGOS (sem funcoes)
    if (!c.funcoes) {
      return (
        (paymentMethod === "debit" && c.tipo === "debito") ||
        (paymentMethod === "credit" && c.tipo === "credito")
      );
    }

    // ✅ CARTÕES NOVOS / HÍBRIDOS
    return (
      (paymentMethod === "debit" && c.funcoes.debito) ||
      (paymentMethod === "credit" && c.funcoes.credito)
    );
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>
          Escolher cartão (
          {paymentMethod === "debit" ? "Débito" : "Crédito"})
        </h3>

        {compatibleCards.length === 0 && (
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            Nenhum cartão disponível para esta opção.
          </p>
        )}

        <div style={styles.list}>
          {compatibleCards.map((card) => (
            <button
              key={card.id}
              style={styles.card}
              onClick={() => onSelect(card.id)}
            >
              💳 {card.nome}
            </button>
          ))}
        </div>

        <button style={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#fff",
    fontSize: 14,
    textAlign: "left",
  },
  cancel: {
    background: "#eee",
    border: "none",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
  },
};
