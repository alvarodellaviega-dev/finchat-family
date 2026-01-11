import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { assertMonthOpen } from "./assertMonthOpen";

export async function createExpense({
  familyId,
  expense,
}) {
  const date = new Date(expense.date);
  const month = date.getMonth();
  const year = date.getFullYear();

  // 🔒 REGRA DE NEGÓCIO (FONTE ÚNICA)
  await assertMonthOpen({ familyId, month, year });

  // ✅ Se chegou aqui, o mês está aberto
  await addDoc(
    collection(db, "families", familyId, "expenses"),
    {
      ...expense,
      createdAt: serverTimestamp(),
    }
  );
}
