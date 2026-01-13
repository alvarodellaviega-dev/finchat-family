import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { assertMonthOpen } from "./assertMonthOpen";

export async function createExpense({ familyId, expense }) {
  // 🔐 Garantia de data válida
  const expenseDate =
    expense.date instanceof Date
      ? expense.date
      : new Date(expense.date);

  const month = expenseDate.getMonth();
  const year = expenseDate.getFullYear();

  // 🔒 REGRA DE NEGÓCIO — FONTE ÚNICA
  await assertMonthOpen({ familyId, month, year });

  // ✅ Persistência neutra (expense / credit_payment / parcelas)
  await addDoc(
    collection(db, "families", familyId, "expenses"),
    {
      ...expense,
      date: expenseDate,        // data real do lançamento
      createdAt: serverTimestamp(), // auditoria
    }
  );
}
