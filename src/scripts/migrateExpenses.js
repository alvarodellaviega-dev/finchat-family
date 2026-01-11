import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const FAMILY_ID = "finchat-family-main";

export async function migrateExpenses() {
  const ref = collection(db, "families", FAMILY_ID, "expenses");
  const snap = await getDocs(ref);

  for (const d of snap.docs) {
    const data = d.data();

    const update = {};

    if (!data.category) update.category = "Outros";
    if (!data.paymentMethod) update.paymentMethod = "Débito";
    if (!data.type) update.type = "debit";

    if (Object.keys(update).length > 0) {
      await updateDoc(
        doc(db, "families", FAMILY_ID, "expenses", d.id),
        update
      );
    }
  }

  alert("Migração concluída ✅");
}
