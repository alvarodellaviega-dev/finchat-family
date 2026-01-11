import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { assertMonthOpen } from "./assertMonthOpen";

export async function deleteExpense({
  familyId,
  expense,
}) {
  const date = new Date(expense.date);
  const month = date.getMonth();
  const year = date.getFullYear();

  // 🔒 REGRA DE NEGÓCIO
  await assertMonthOpen({ familyId, month, year });

  await deleteDoc(
    doc(db, "families", familyId, "expenses", expense.id)
  );
}
