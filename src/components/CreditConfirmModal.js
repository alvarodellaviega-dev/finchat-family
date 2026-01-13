export default function CreditConfirmModal({
  visible,
  value,
  cards = [],
  selectedCardId,
  setSelectedCardId,
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Compra no crédito à vista</h3>

        <p>
          Valor: <strong>R$ {value.toFixed(2)}</strong>
        </p>

        <select
          value={selectedCardId || ""}
          onChange={(e) => setSelectedCardId(e.target.value || null)}
          style={styles.select}
        >
          <option value="">Selecione o cartão</option>

          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </select>

        <div style={styles.actions}>
          <button onClick={onCancel}>Cancelar</button>

          <button
            onClick={() => {
              if (!selectedCardId) {
                alert("Selecione um cartão");
                return;
              }
              onConfirm();
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

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
    borderRadius: 10,
    width: 320,
  },
  select: {
    width: "100%",
    padding: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
  },
};
