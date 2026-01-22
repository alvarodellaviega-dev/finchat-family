// src/hooks/useExpenses.js
import { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export function useExpenses() {
  const user = auth.currentUser;
  const bottomRef = useRef(null);

  /* ================= STATE ================= */

  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [cards, setCards] = useState([]);

  const [editExpense, setEditExpense] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCardId, setSelectedCardId] = useState(null);

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      query(
        collection(db, "families", FAMILY_ID, "expenses"),
        orderBy("createdAt", "asc")
      ),
      snap => {
        setExpenses(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "cards"),
      snap => {
        setCards(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );
      }
    );
  }, [user]);

  /* ================= ACTIONS ================= */

  async function sendEmoji(emoji) {
    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      type: "emoji",
      emoji,
      user: user.email,
      createdAt: serverTimestamp(),
    });
    setShowEmojiPicker(false);
  }

  async function sendExpense(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const match = text.match(/(\d+([.,]\d+)?)/);
    if (!match) return;

    const value = Number(match[1].replace(",", "."));

    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      text: text.trim(),
      amount: -Math.abs(value),
      paymentMethod,
      cardId: paymentMethod === "debit" ? selectedCardId : null,
      user: user.email,
      createdAt: serverTimestamp(),
    });

    setText("");
    setPaymentMethod("cash");
    setSelectedCardId(null);
  }

  async function updateExpense(id, data) {
    const ref = doc(
      db,
      "families",
      FAMILY_ID,
      "expenses",
      id
    );

    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    setEditExpense(null);
  }

  async function deleteExpense(id) {
    const ref = doc(
      db,
      "families",
      FAMILY_ID,
      "expenses",
      id
    );

    await deleteDoc(ref);
    setEditExpense(null);
  }

  /* ================= BALANCE ================= */

  const balance = expenses.reduce((sum, e) => {
    if (e.paymentMethod === "credit") return sum;
    return sum + (Number(e.amount) || 0);
  }, 0);

  /* ================= EXPORT ================= */

  return {
    text,
    setText,
    expenses,
    cards,
    balance,

    editExpense,
    setEditExpense,

    sendExpense,
    sendEmoji,
    updateExpense,
    deleteExpense,

    showEmojiPicker,
    setShowEmojiPicker,

    bottomRef,
  };
}
