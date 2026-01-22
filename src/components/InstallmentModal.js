import { useState } from "react";

export default function InstallmentModal({
  data,
  cards,
  selectedCardId,
  setSelectedCardId,
  onConfirm,
  onCancel,
}) {
  const [total, setTotal] = useState(data.total);

  const installmentValue =
    total > 0
      ? data.installmentValue
      : 0;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>💳 Confirmação de Crédito</h3>

        <div style={block}>
          <span>Valor da parcela</span>
          <strong>R$ {installmentValue.toFixed(2)}</strong>
        </div>

        <div style={block}>
          <span>Total de parcelas</span>
          <input
            type="number"
            min="1"
            value={total}
            onChange={(e) =>
              setTotal(Math.max(1, Number(e.target.value)))
            }
          />
        </div>

        <div style={block}>
          <span>Cartão</span>
          <select
            value={selectedCardId || ""}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="">Selecione</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={actions}>
          <button onClick={onCancel} style={cancel}>
            Cancelar
          </button>

          <button
            disabled={!selectedCardId}
            style={confirm}
            onClick={() =>
              onConfirm({
                total,
                value: installmentValue,
                startMonth: data.startMonth,
                startYear: data.startYear,
              })
            }
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  width: 320,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const block = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
};

const actions = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
};

const cancel = {
  background: "#eee",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const confirm = {
  background: "#25D366",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};
