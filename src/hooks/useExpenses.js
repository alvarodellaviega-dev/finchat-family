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

/* ================= REGRAS ================= */

const INCOME_WORDS = [
  "ganhei",
  "recebi",
  "achei",
  "fiz",
  "salario",
  "pagamento",
  "pix",
];

function isIncome(text) {
  const t = text.toLowerCase();
  return INCOME_WORDS.some((w) => t.includes(w));
}

/* ================= HOOK ================= */

export function useExpenses() {
  const user = auth.currentUser;
  const bottomRef = useRef(null);

  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ ESTAVA FALTANDO
  const [editExpense, setEditExpense] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCardId, setSelectedCardId] = useState(null);

  /* ================= FIRESTORE ================= */

  // EXPENSES
  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      query(
        collection(db, "families", FAMILY_ID, "expenses"),
        orderBy("createdAt", "asc")
      ),
      (snap) => {
        setExpenses(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    );
  }, [user]);

  // CARDS
  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "cards"),
      (snap) =>
        setCards(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        )
    );
  }, [user]);

  // ✅ CATEGORIES (ESTA ERA A FALHA)
  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "categories"),
      (snap) =>
        setCategories(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) =>
              a.name.localeCompare(b.name, "pt-BR")
            )
        )
    );
  }, [user]);

  /* ================= ACTIONS ================= */

  async function sendEmoji(emoji) {
    await addDoc(
      collection(db, "families", FAMILY_ID, "expenses"),
      {
        type: "emoji",
        emoji,
        user: user.email,
        createdAt: serverTimestamp(),
      }
    );
  }

  async function sendExpense({ installments = null } = {}) {
    if (!text.trim()) return;

    const match = text.match(/(\d+([.,]\d+)?)/);
    if (!match) return;

    const value = Number(match[1].replace(",", "."));
    const income = isIncome(text);

    // ENTRADA
    if (income) {
      await addDoc(
        collection(db, "families", FAMILY_ID, "expenses"),
        {
          text: text.trim(),
          amount: Math.abs(value),
          entryType: "income",
          category: null,
          paymentMethod: null,
          cardId: null,
          installments: null,
          user: user.email,
          createdAt: serverTimestamp(),
        }
      );

      setText("");
      return;
    }

    // CRÉDITO
    if (paymentMethod === "credit") {
      if (!selectedCardId) {
        alert("Selecione um cartão");
        return;
      }

      await addDoc(
        collection(db, "families", FAMILY_ID, "expenses"),
        {
          text: text.trim(),
          amount: 0,
          entryType: "expense",
          category: "Outros",
          paymentMethod: "credit",
          cardId: selectedCardId,
          installments,
          user: user.email,
          createdAt: serverTimestamp(),
        }
      );

      setText("");
      setPaymentMethod("cash");
      setSelectedCardId(null);
      return;
    }

    // CASH / DÉBITO
    if (paymentMethod === "debit" && !selectedCardId) {
      alert("Selecione um cartão");
      return;
    }

    await addDoc(
      collection(db, "families", FAMILY_ID, "expenses"),
      {
        text: text.trim(),
        amount: -Math.abs(value),
        entryType: "expense",
        category: "Outros",
        paymentMethod,
        cardId: paymentMethod === "debit" ? selectedCardId : null,
        installments: null,
        user: user.email,
        createdAt: serverTimestamp(),
      }
    );

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
    if (e.paymentMethod === "credit") return sum;
    return sum + (Number(e.amount) || 0);
  }, 0);

  /* ================= EXPORT ================= */

  return {
    expenses,
    cards,
    categories, // ✅ AGORA EXISTE DE VERDADE
    balance,

    text,
    setText,

    paymentMethod,
    setPaymentMethod,
    selectedCardId,
    setSelectedCardId,

    sendExpense,
    sendEmoji,

    editExpense,
    setEditExpense,
    updateExpense,
    deleteExpense,

    bottomRef,
  };
}
