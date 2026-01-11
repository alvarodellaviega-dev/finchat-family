import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { assertMonthOpen } from "./assertMonthOpen";

export async function updateExpense({
  familyId,
  expenseId,
  expense,
}) {
  const date = new Date(expense.date);
  const month = date.getMonth();
  const year = date.getFullYear();

  // 🔒 REGRA DE NEGÓCIO
  await assertMonthOpen({ familyId, month, year });

  await updateDoc(
    doc(db, "families", familyId, "expenses", expenseId),
    expense
  );
}
