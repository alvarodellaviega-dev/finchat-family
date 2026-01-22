export default function InstallmentBubble({ expense }) {
  const { installments } = expense;

  if (
    !installments ||
    typeof installments.value !== "number" ||
    typeof installments.total !== "number"
  ) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 6,
        paddingTop: 6,
        borderTop: "1px dashed #999",
        fontSize: 13,
      }}
    >
      💳 Crédito ({installments.total}x) <br />
      <strong>
        R$ {installments.value.toFixed(2)}
      </strong>
    </div>
  );
}
