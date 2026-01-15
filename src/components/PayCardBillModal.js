import { useState } from "react";

export default function PayCardBillModal({
  cards,
  defaultValue,
  onConfirm,
  onCancel,
}) {
  const [selectedCardId, setSelectedCardId] = useState("");
  const [value, setValue] = useState(defaultValue || "");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Pagamento de fatura</h3>

        {/* VALOR */}
        <label style={styles.label}>
          Valor pago
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
          />
        </label>

        {/* CARTÃO */}
        <label style={styles.label}>
          Cartão
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="">Selecione um cartão</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.nome}
              </option>
            ))}
          </select>
        </label>

        {/* AÇÕES */}
        <div style={styles.actions}>
          <button
            style={styles.confirm}
            disabled={!selectedCardId || !value}
            onClick={() =>
              onConfirm({
                cardId: selectedCardId,
                value: Number(value),
              })
            }
          >
            Confirmar pagamento
          </button>

          <button style={styles.cancel} onClick={onCancel}>
            Cancelar
          </button>
        </div>
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
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },
  confirm: {
    background: "#25D366",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
  },
  cancel: {
    background: "#eee",
    border: "none",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
  },
};
