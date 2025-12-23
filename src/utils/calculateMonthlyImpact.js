// FinChat Family
// File: calculateMonthlyImpact.js
// Scope: Cálculo isolado do impacto mensal de um lançamento
// ⚠️ NÃO acessa Firestore
// ⚠️ NÃO depende de React
// ⚠️ NÃO altera estado
// ⚠️ NÃO altera UI

/**
 * Calcula quanto um lançamento impacta um mês/ano específico
 *
 * @param {object} expense - Documento do Firestore
 * @param {number} month - mês alvo (0-11)
 * @param {number} year - ano alvo (YYYY)
 *
 * @returns {number} valor a ser somado ao saldo do mês
 */
export function calculateMonthlyImpact(expense, month, year) {
  if (!expense) return 0;

  // ======================
  // 💳 PARCELAMENTO
  // ======================
  if (
    expense.installments &&
    expense.installments.total > 1 &&
    expense.installments.startMonth != null &&
    expense.installments.startYear != null
  ) {
    const {
      startMonth,
      startYear,
      total,
      value,
    } = expense.installments;

    const startIndex =
      startYear * 12 + startMonth;
    const targetIndex =
      year * 12 + month;

    const current =
      targetIndex - startIndex + 1;

    // ❌ fora do intervalo
    if (current < 1 || current > total) {
      return 0;
    }

    // ✅ parcela válida do mês
    return -Math.abs(value);
  }

  // ======================
  // 💸 GASTO / 💰 ENTRADA NORMAL
  // ======================
  if (typeof expense.amount === "number") {
    if (!expense.createdAt) return 0;

    const d = expense.createdAt.toDate();
    if (
      d.getMonth() === month &&
      d.getFullYear() === year
    ) {
      return expense.amount;
    }
  }

  return 0;
}
