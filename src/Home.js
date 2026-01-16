// FinChat Family
// File: Home.js
// Version: 2.0.0-stable
// Status: fluxo financeiro validado (cash / debit / credit / installments)

import CardSelectModal from "./components/CardSelectModal";

import { useEffect, useState, useRef } from "react";
import { auth } from "./firebase";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

// Components
import PaymentBar from "./components/PaymentBar";

import InstallmentModal from "./InstallmentModal";
import InstallmentBubble from "./components/InstallmentBubble";
import EmojiPicker from "./components/EmojiPicker";
import EditExpenseModal from "./components/EditExpenseModal";
import CategoryModal from "./components/CategoryModal";
import CategoryDetailsModal from "./components/CategoryDetailsModal";
import FiltersModal from "./components/FiltersModal";

// Utils
import { parseInstallment } from "./installmentsParser";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const CATEGORY_LIMITS = {
  Mercado: 800,
  Alimentação: 900,
  Lanche: 300,
  Transporte: 300,
  Combustível: 2000,
  "Manutenção Carro": 600,
  "Manutenção Casa": 600,
  Saúde: 400,
  Lazer: 400,
  "Pagamentos Cartão": 6000,
  Impostos: 300,
  Outros: 300,
};
function formatChatDate(date) {
  const today = new Date();
  const d = new Date(date);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";

  const sameYear = d.getFullYear() === today.getFullYear();

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export default function Home({ goReport, goInstallments, goSettings }) {
  const user = auth.currentUser;
  const bottomRef = useRef(null);
  const now = new Date();

  /* ================= STATE ================= */

  const APP_VERSION = "2.0.0-stable";
const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);

  const [editExpense, setEditExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
const [newCategory, setNewCategory] = useState("");
const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [installmentData, setInstallmentData] = useState(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [pendingText, setPendingText] = useState("");

  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [typeFilter, setTypeFilter] = useState("all");

  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | debit | credit
  const [selectedCardId, setSelectedCardId] = useState(null);
const [showCardSelect, setShowCardSelect] = useState(false);
const [showPayBillModal, setShowPayBillModal] = useState(false);
const [payBillValue, setPayBillValue] = useState(0);

  const isIncomeText = ["recebi", "ganhei", "pix", "salário", "salario"]
    .some((w) => text.toLowerCase().includes(w));

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
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
      }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "categories"),
      (snap) => {
        setCategories(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        );
      }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "cards"),
      (snap) => {
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
  }, [user]);

/* ================= FILTER (CHAT) ================= */

const filtered = expenses.filter((e) => {
  // 😊 emoji sempre aparece
  if (e.type === "emoji") return true;

  if (!e.createdAt?.toDate) return false;

  const d = e.createdAt.toDate();
  if (d.getMonth() !== month) return false;
  if (d.getFullYear() !== year) return false;

  const amount = Number(e.amount) || 0;

  // 🟢 ENTRADAS
  if (typeFilter === "income") {
    return amount > 0 || e.type === "income";
  }

  // 🔴 SAÍDAS
  if (typeFilter === "expense") {
    return amount < 0 || e.type === "expense";
  }

  // 🔵 TODOS
  return true;
});


/* ================= BALANCE ================= */
/**
 * REGRA FINAL DO SALDO:
 * - Entradas SOMAM
 * - Débito / dinheiro SOMAM
 * - Crédito (à vista ou parcelado) NUNCA entra
 */

const balance = filtered.reduce((sum, e) => {
  // ❌ crédito nunca entra no saldo
  if (e.paymentMethod === "credit") return sum;

  return sum + (Number(e.amount) || 0);
}, 0);

/* ================= ACTIONS ================= */

// 🔹 SALVA DESPESA (ENTRADA OU SAÍDA)
async function saveExpense(rawText) {
  const match = rawText.match(/(\d+([.,]\d+)?)/);
  if (!match) return;

  const value = Number(match[1].replace(",", "."));
  const lower = rawText.toLowerCase();

  const isIncome = ["recebi", "ganhei", "pix", "salário", "salario"]
    .some((w) => lower.includes(w));

  /* ===== ENTRADA ===== */
  if (isIncome) {
    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      text: rawText.trim(),
      amount: Math.abs(value),
      type: "income",
      category: null,
      paymentMethod: "income",
      cardId: null,
      createdAt: serverTimestamp(),
      user: user.email,
    });
    return;
  }

  /* ===== SAÍDA ===== */

  // ❌ crédito nunca passa aqui
  if (paymentMethod === "credit") {
    console.warn("Crédito deve passar pelo fluxo de parcelamento");
    return;
  }

  // 💳 débito exige cartão
  if (paymentMethod === "debit" && !selectedCardId) {
    alert("Selecione um cartão de débito");
    return;
  }

  await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
    text: rawText.trim(),
    amount: -Math.abs(value),
    type: "expense",
    category: "Outros",
    paymentMethod,
    cardId: paymentMethod === "debit" ? selectedCardId : null,
    createdAt: serverTimestamp(),
    user: user.email,
  });
}

// 🔹 ENVIO DO CHAT
async function sendExpense(e) {
  e.preventDefault();
  if (!text.trim()) return;

  const lower = text.toLowerCase();
  const isIncome = ["recebi", "ganhei", "pix", "salário", "salario"]
    .some((w) => lower.includes(w));

  // ✅ ENTRADA: ignora método e NÃO abre modal
  if (isIncome) {
    await saveExpense(text);
    setText("");
    setPaymentMethod("cash");
    setSelectedCardId(null);
    return;
  }

  // 🟣 CRÉDITO (à vista ou parcelado)
  if (paymentMethod === "credit") {
    const parsed = parseInstallment(text);

    const data = parsed ?? {
      total: 1,
      installmentValue: (() => {
        const match = text.match(/(\d+([.,]\d+)?)/);
        if (!match) return 0;
        return Number(match[1].replace(",", "."));
      })(),
      startMonth: new Date().getMonth(),
      startYear: new Date().getFullYear(),
    };

    setPendingText(text);
    setInstallmentData(data);
    setShowInstallmentModal(true);
    setText("");
    return;
  }

  // 💼 carteira / 💳 débito
  await saveExpense(text);
  setText("");
}

// 🔹 CONFIRMA CRÉDITO
async function confirmInstallment(extraData) {
  if (!selectedCardId) {
    alert("Selecione um cartão");
    return;
  }

  await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
    text: pendingText,
    amount: 0, // ❗ crédito não entra no saldo
    type: "expense",
    category: "Outros",
    paymentMethod: "credit",
    cardId: selectedCardId,

    // 🔴 ESSENCIAL PARA APARECER NO 💳
    installments: {
      total: extraData.total,
      value: extraData.installmentValue,
      startMonth: extraData.startMonth,
      startYear: extraData.startYear,
    },

    createdAt: serverTimestamp(),
    user: user.email,
  });

  setShowInstallmentModal(false);
  setInstallmentData(null);
  setPendingText("");
  setSelectedCardId(null);
}


// 🔹 EMOJI
async function sendEmoji(emoji) {
  await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
    type: "emoji",
    emoji,
    user: user.email,
    createdAt: serverTimestamp(),
  });
  setShowEmojiPicker(false);
}

/* ================= UI ================= */

return (
  <>
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong>FinChat Family</strong>
          <span style={{ fontSize: 11, opacity: 0.7 }}>
            v{APP_VERSION}
          </span>
        </div>

        <div style={styles.headerActions}>
          <button onClick={() => setShowFilters(true)}>🔍</button>
          <button onClick={() => setShowCategories(true)}>🗂️</button>
          <button onClick={goInstallments}>💳</button>
          <button onClick={goReport}>📊</button>
          <button onClick={goSettings}>⚙️</button>
          <button onClick={() => signOut(auth)}>Sair</button>
        </div>
      </header>

      <div style={styles.balance}>
        Saldo atual:{" "}
        <strong style={{ color: balance >= 0 ? "green" : "red" }}>
          R$ {balance.toFixed(2)}
        </strong>
      </div>

      {/* CHAT */}
      {/* CHAT */}
<div style={styles.chat}>
  {filtered.map((e) => (
    <div
      key={e.id}
      style={{
        ...styles.bubble,
        ...(e.user === user.email
          ? styles.bubbleMe
          : styles.bubbleOther),
      }}
    >
      {e.type === "emoji" ? (
        <div style={{ fontSize: 28 }}>{e.emoji}</div>
      ) : (
        <>
          {e.category && (
            <div style={styles.categoryLabel}>{e.category}</div>
          )}

          <div>{e.text}</div>

          <strong>R$ {Math.abs(e.amount).toFixed(2)}</strong>

          {(e.paymentMethod === "credit" ||
            e.paymentMethod === "debit") &&
            e.cardId && (
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                💳{" "}
                {cards.find((c) => c.id === e.cardId)?.name ||
                  "Cartão"}
              </div>
            )}

          {e.installments && (
            <InstallmentBubble expense={e} />
          )}

          <button
            style={styles.editButton}
            onClick={() => setEditExpense(e)}
          >
            ✏️
          </button>
        </>
      )}
    </div>
  ))}
  <div ref={bottomRef} />
</div>


      <PaymentBar
        visible={!isIncomeText && text.trim().length > 0}
        paymentMethod={paymentMethod}
        setPaymentMethod={(method) => {
          setPaymentMethod(method);
          setSelectedCardId(null);

          if (method === "debit" || method === "credit") {
            setShowCardSelect(true);
          }
        }}
      />

      <form onSubmit={sendExpense} style={styles.inputBar}>
        <span
          style={styles.iconButton}
          onClick={() => setShowEmojiPicker(true)}
        >
          😊
        </span>

        <input
          style={styles.textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite um gasto ou ganho..."
        />

        <button
          type="submit"
          style={styles.sendButton}
          disabled={!text.trim()}
        >
          ➤
        </button>
      </form>
    </div>

    {showEmojiPicker && (
      <EmojiPicker
        onSelect={sendEmoji}
        onClose={() => setShowEmojiPicker(false)}
      />
    )}

    {editExpense && (
      <EditExpenseModal
        expense={editExpense}
        FAMILY_ID={FAMILY_ID}
        categories={categories}
        onClose={() => setEditExpense(null)}
      />
    )}

    {showFilters && (
      <FiltersModal
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        MONTHS={MONTHS}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onClose={() => setShowFilters(false)}
      />
    )}

    {showCategories && (
      <CategoryModal
        db={db}
        FAMILY_ID={FAMILY_ID}
        categories={categories}
        expenses={expenses}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onClose={() => setShowCategories(false)}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setShowCategories(false);
          setShowCategoryDetails(true);
        }}
      />
    )}

    {showCategoryDetails && selectedCategory && (
      <CategoryDetailsModal
        category={selectedCategory}
        expenses={expenses}
        month={month}
        year={year}
        limits={CATEGORY_LIMITS}
        onClose={() => {
          setShowCategoryDetails(false);
          setSelectedCategory(null);
        }}
      />
    )}

    {showInstallmentModal && installmentData && (
      <InstallmentModal
        data={installmentData}
        cards={cards}
        selectedCardId={selectedCardId}
        setSelectedCardId={setSelectedCardId}
        onConfirm={confirmInstallment}
        onCancel={() => setShowInstallmentModal(false)}
      />
    )}

    {showCardSelect &&
      (paymentMethod === "debit" ||
        paymentMethod === "credit") && (
        <CardSelectModal
          cards={cards}
          paymentMethod={paymentMethod}
          onSelect={(cardId) => {
            setSelectedCardId(cardId);
            setShowCardSelect(false);
          }}
          onCancel={() => {
            setShowCardSelect(false);
            setPaymentMethod("cash");
            setSelectedCardId(null);
          }}
        />
      )}
  </>
);
}


/* ================= STYLES ================= */

const styles = {
  container: {
    height: "100dvh", // ✅ corrige iOS (barra do Safari)
    display: "flex",
    flexDirection: "column",
  },

  header: {
    background: "#075E54",
    color: "#fff",
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
  },

  headerActions: {
    display: "flex",
    gap: 6,
  },

  balance: {
    padding: 8,
    textAlign: "center",
    background: "#f1f8e9",
  },

  chat: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    WebkitOverflowScrolling: "touch", // ✅ scroll suave no iPhone
    background: "#ECE5DD", // 🔹 fundo estilo WhatsApp
  },

  /* ===== BOLHAS ===== */

  bubble: {
    maxWidth: "75%",
    padding: "8px 12px",
    borderRadius: 14,
    position: "relative",
    fontSize: 14,
    lineHeight: "18px",
    wordBreak: "break-word",
  },

  bubbleMe: {
    background: "#DCF8C6", // 🟢 verde WhatsApp
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
    boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
  },

  bubbleOther: {
    background: "#FFFFFF", // ⚪ branco (outra pessoa)
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
    boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
  },

  categoryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },

  editButton: {
    position: "absolute",
    bottom: 4,
    right: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 12,
  },

  /* ===== INPUT ===== */

  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: 8,
    borderTop: "1px solid #ddd",
    position: "sticky", // ✅ mantém fixo no iOS
    bottom: 0,
    background: "#fff",
  },

  iconButton: {
    fontSize: 22,
    marginRight: 8,
    cursor: "pointer",
  },

  textInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
    fontSize: 14,
  },

  sendButton: {
    marginLeft: 8,
    fontSize: 20,
    background: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
  },

  /* ===== PAYMENT BAR ===== */

  paymentBar: {
    display: "flex",
    gap: 6,
    padding: "6px 8px",
    borderTop: "1px solid #ddd",
    background: "#fafafa",
  },

  paymentButton: {
    flex: 1,
    border: "none",
    borderRadius: 6,
    padding: "6px 0",
    fontSize: 13,
    cursor: "pointer",
  },
};
