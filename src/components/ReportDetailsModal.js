export default function ReportDetailsModal({
  title,
  expenses,
  onClose,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{title}</h3>

        {expenses.length === 0 && (
          <p>Nenhum lançamento.</p>
        )}

        {expenses.map((e) => (
          <div key={e.id} style={styles.item}>
            <span>{e.text}</span>
            <strong>
              R$ {Math.abs(e.amount).toFixed(2)}
            </strong>
          </div>
        ))}

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
