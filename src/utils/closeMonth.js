import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();

export async function closeMonth({
  familyId,
  month,
  year,
  report,
}) {
  const monthId = `${year}-${String(month + 1).padStart(2, "0")}`;

  const ref = doc(
    db,
    "families",
    familyId,
    "closedMonths",
    monthId
  );

  await setDoc(ref, {
    month,
    year,
    income: report.income,
    debitExpenses: report.debitExpenses,
    installments: report.installments,
    balance: report.balance,
    byCategory: report.byCategory,
    byPayment: report.byPayment,
    closedAt: serverTimestamp(),
  });
}
