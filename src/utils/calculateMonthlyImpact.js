export function calculateMonthlyImpact(expense, month, year) {
  if (!expense || !expense.createdAt) return 0;

  const d = expense.createdAt.toDate();
  if (d.getMonth() !== month || d.getFullYear() !== year)
    return 0;

  // 💰 ENTRADA
  if (expense.type === "income") {
    return Math.abs(expense.amount);
  }

  // 💳 CRÉDITO PARCELADO → impacto só nas parcelas
  if (
    expense.paymentMethod === "credit" &&
    expense.installments &&
    expense.installments.total > 1
  ) {
    const { startMonth, startYear, total, value } =
      expense.installments;

    const startIndex = startYear * 12 + startMonth;
    const targetIndex = year * 12 + month;
    const current = targetIndex - startIndex + 1;

    if (current < 1 || current > total) return 0;

    return -Math.abs(value);
  }

  // 💳 CRÉDITO À VISTA → SAÍDA DO MÊS
  if (
    expense.paymentMethod === "credit" &&
    !expense.installments
  ) {
    return -Math.abs(expense.amount);
  }

  // 💸 DÉBITO → SAÍDA DO MÊS
  if (expense.paymentMethod === "debit") {
    return -Math.abs(expense.amount);
  }

  return 0;
}
