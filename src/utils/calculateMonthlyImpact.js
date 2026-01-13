import {
  TRANSACTION_TYPES,
  PAYMENT_METHODS
} from "../types/transaction";

export function calculateMonthlyImpact(expense, month, year) {
  if (!expense || !expense.createdAt) return 0;

  const d = expense.createdAt.toDate();
  if (d.getMonth() !== month || d.getFullYear() !== year)
    return 0;

  const amount = Math.abs(expense.amount);

  // 💰 ENTRADA
  if (expense.type === TRANSACTION_TYPES.INCOME) {
    return amount;
  }

  // 💸 SAÍDA REAL DE CAIXA (DÉBITO / DINHEIRO)
  if (
    expense.type === TRANSACTION_TYPES.EXPENSE &&
    expense.paymentMethod !== PAYMENT_METHODS.CREDIT
  ) {
    return -amount;
  }

  // 💳 PAGAMENTO DE CARTÃO (PASSO 3)
  if (expense.type === TRANSACTION_TYPES.CREDIT_PAYMENT) {
    return -amount;
  }

  // ❌ COMPRA NO CRÉDITO NÃO AFETA CAIXA
  return 0;
}
