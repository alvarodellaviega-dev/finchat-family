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

/* 🔑 REGRAS */
const INCOME_WORDS = [
  "ganhei",
  "recebi",
  "achei",
  "fiz",
  "salario",
  "pagamento",
];

function detectEntryType(text) {
  const t = text.toLowerCase();
  return INCOME_WORDS.some((w) => t.includes(w))
    ? "income"
    : "expense";
}

export function useExpenses() {
  const user = auth.currentUser;
  const bottomRef = useRef(null);

  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editExpense, setEditExpense] = useState(null);

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
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
      (snap) =>
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "categories"),
      (snap) =>
        setCategories(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        )
    );
  }, [user]);

  /* ================= ACTIONS ================= */

  // ✅ ENVIO DE EMOJI (ESTAVA FALTANDO)
  async function sendEmoji(emoji) {
    if (!emoji) return;

    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      type: "emoji",
      emoji,
      user: user?.email,
      createdAt: serverTimestamp(),
    });
  }

  async function sendExpense({ installments = null } = {}) {
    if (!text.trim()) return;

    const valueMatch = text.match(/(\d+([.,]\d+)?)/);
    if (!valueMatch) return;

    const value = Number(valueMatch[1].replace(",", "."));
    const entryType = detectEntryType(text);

    if (
      entryType === "expense" &&
      paymentMethod === "credit" &&
      !selectedCardId
    ) {
      alert("Selecione um cartão");
      return;
    }

    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      text: text.trim(),
      amount:
        entryType === "income"
          ? Math.abs(value)
          : -Math.abs(value),

      entryType,
      paymentMethod: entryType === "expense" ? paymentMethod : null,
      cardId:
        paymentMethod === "credit" || paymentMethod === "debit"
          ? selectedCardId
          : null,

      installments,
      user: user?.email,
      createdAt: serverTimestamp(),
    });

    setText("");
    setPaymentMethod("cash");
    setSelectedCardId(null);
  }

  async function updateExpense(id, data) {
    await updateDoc(
      doc(db, "families", FAMILY_ID, "expenses", id),
      { ...data, updatedAt: serverTimestamp() }
    );
    setEditExpense(null);
  }

  async function deleteExpense(id) {
    await deleteDoc(
      doc(db, "families", FAMILY_ID, "expenses", id)
    );
    setEditExpense(null);
  }

  /* ================= BALANCE ================= */

  const balance = expenses.reduce((sum, e) => {
    // ❌ crédito não entra direto no saldo
    if (e.paymentMethod === "credit") return sum;
    return sum + (Number(e.amount) || 0);
  }, 0);

  return {
    expenses,
    cards,
    categories,
    balance,

    text,
    setText,

    paymentMethod,
    setPaymentMethod,
    selectedCardId,
    setSelectedCardId,

    sendExpense,
    sendEmoji, // ✅ AGORA EXISTE
    updateExpense,
    deleteExpense,

    editExpense,
    setEditExpense,

    bottomRef,
  };
}
