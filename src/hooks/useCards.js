// FinChat Family
// Hook: useCards
// Scope: Gestão isolada de cartões (débito / crédito)
// Status: BLINDADO • pronto para compras à vista e parceladas

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth } from "../firebase";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export function useCards() {
  const user = auth.currentUser;

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "families", FAMILY_ID, "cards"),
      orderBy("name")
    );

    const unsub = onSnapshot(q, (snap) => {
      setCards(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoadingCards(false);
    });

    return () => unsub();
  }, [user]);

  /* ================= ACTIONS ================= */

  async function addCard(data) {
    if (!data?.name || !data?.type) return;

    if (data.type === "credit") {
      if (
        !data.limit ||
        !data.closingDay ||
        !data.dueDay
      ) {
        throw new Error("Cartão de crédito incompleto");
      }
    }

    const payload = {
      name: data.name.trim(),
      type: data.type, // "debit" | "credit"
      active: true,
      createdAt: serverTimestamp(),
    };

    if (data.type === "credit") {
      payload.limit = Number(data.limit);
      payload.closingDay = Number(data.closingDay);
      payload.dueDay = Number(data.dueDay);
    }

    await addDoc(
      collection(db, "families", FAMILY_ID, "cards"),
      payload
    );
  }

  async function toggleCard(cardId, active) {
    await updateDoc(
      doc(db, "families", FAMILY_ID, "cards", cardId),
      { active }
    );
  }

  return {
    cards,
    loadingCards,

    creditCards: cards.filter(
      (c) => c.type === "credit" && c.active
    ),

    debitCards: cards.filter(
      (c) => c.type === "debit" && c.active
    ),

    addCard,
    toggleCard,
  };
}

