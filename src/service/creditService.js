import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Cria uma despesa de crédito.
 * ⚠️ NÃO afeta saldo (amount = 0)
 * ⚠️ Usado tanto para 1x quanto parcelado
 */
export async function createCreditExpense({
  db,
  FAMILY_ID,
  text,
  cardId,
  installments,
  userEmail,
}) {
  if (!cardId) {
    throw new Error("Cartão de crédito é obrigatório");
  }

  return addDoc(
    collection(db, "families", FAMILY_ID, "expenses"),
    {
      text,
      amount: 0, // CRÉDITO NUNCA AFETA SALDO
      type: "expense",
      category: "Outros",
      paymentMethod: "credit",
      cardId,
      installments,
      createdAt: serverTimestamp(),
      user: userEmail,
    }
  );
}
