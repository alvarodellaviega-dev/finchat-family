import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // ajuste se seu export for diferente

export async function assertMonthOpen({ familyId, year, month }) {
  const id = `${year}-${String(month + 1).padStart(2, "0")}`;
  const ref = doc(db, "families", familyId, "closedMonths", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    throw new Error("Este mês está fechado. Não é possível adicionar despesas.");
  }
}
