import { useState } from "react";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function InstallmentModal({
  data,
  onConfirm,
  onCancel,
}) {
  const now = new Date();

  const [card, setCard] = useState(data.card || "");
  const [month, setMonth] = useState(
    data.startMonth ?? now.getMonth()
  );
  const [year, setYear] = useState(
    data.startYear ?? now.getFullYear()
  );

  const years = [];
  for (let i = 0; i <= 5; i++) {
    years.push(now.getFullYear() + i);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Parcelamento</h3>

        {/* INFO */}
        <div style={styles.block}>
          <div>Total de parcelas: {data.total}x</div>
          <div>
            Valor total: R${" "}
            {data.amount.toFixed(2)}
          </div>
          <div>
            Valor da parcela: R${" "}
            {data.installmentValue.toFixed(2)}
          </div>
        </div>

        {/* CARTÃO */}
        <label style={styles.label}>
          Cartão
          <input
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="Ex: Nubank"
          />
        </label>

        {/* DATA */}
        <div style={styles.row}>
          <label style={styles.label}>
            Mês inicial
            <select
              value={month}
              onChange={(e) =>
                setMonth(Number(e.target.value))
              }
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Ano inicial
            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* AÇÕES */}
        <div style={styles.actions}>
          <button
            style={styles.confirm}
            onClick={() =>
              onConfirm({
                paymentType: "credito",
                installments: {
                  total: data.total,
                  value: data.installmentValue,
                  startMonth: month,
                  startYear: year,
                  card,
                },
              })
            }
          >
            Confirmar parcelamento
          </button>

          <button
            style={styles.cancel}
            onClick={onCancel}
          >
            Salvar como gasto normal
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
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  block: {
    background: "#f4f4f4",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  row: {
    display: "flex",
    gap: 10,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
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
    background: "#ddd",
    border: "none",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
  },
};
