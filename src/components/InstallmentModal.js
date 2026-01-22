// src/components/InstallmentModal.js
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

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Confirmação de crédito</h3>

        <p>
          Valor da parcela: <strong>R$ {data.installmentValue.toFixed(2)}</strong>
        </p>

        <label>
          Total de parcelas
          <input
            type="number"
            min="1"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
          />
        </label>

        <label>
          Cartão
          <select
            value={selectedCardId || ""}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="">Selecione</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </label>

        <button
          disabled={!selectedCardId}
          onClick={() =>
            onConfirm({
              total,
              installmentValue: data.installmentValue,
              startMonth: data.startMonth,
              startYear: data.startYear,
            })
          }
        >
          Confirmar
        </button>

        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  width: 320,
};
