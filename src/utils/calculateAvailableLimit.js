import { TRANSACTION_TYPES, PAYMENT_METHODS } from "../types/transaction";

export function calculateAvailableLimit(card, transactions) {
  let used = 0;

  for (const t of transactions) {
    // 🛒 COMPRA NO CRÉDITO → CONSOME LIMITE
    if (
      t.type === TRANSACTION_TYPES.EXPENSE &&
      t.paymentMethod === PAYMENT_METHODS.CREDIT &&
      t.cardId === card.id
    ) {
      used += Math.abs(t.amount);
    }

    // 💳 PAGAMENTO DO CARTÃO → LIBERA LIMITE
    if (
      t.type === TRANSACTION_TYPES.CREDIT_PAYMENT &&
      t.cardId === card.id
    ) {
      used -= Math.abs(t.amount);
    }
  }

  return Math.max(card.limit - used, 0);
}
