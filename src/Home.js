// FinChat Family
// File: Home.js
// Scope: Tela principal (chat + lançamentos)

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
import EmojiPicker from "./components/EmojiPicker";
import EditExpenseModal from "./components/EditExpenseModal";
import CategoryModal from "./components/CategoryModal";
import FiltersModal from "./components/FiltersModal";
import InstallmentModal from "./InstallmentModal";
import InstallmentBubble from "./components/InstallmentBubble";

// Utils
import { parseInstallment } from "./installmentsParser";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export default function Home({
  goReport,
  goInstallments,
  goSettings,
  appVersion,
}) {
  const user = auth.currentUser;
  const bottomRef = useRef(null);

  /* ================= STATE ================= */
  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [installmentData, setInstallmentData] = useState(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [pendingText, setPendingText] = useState("");

  /* ================= FIRESTORE ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "families", FAMILY_ID, "expenses"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    });
  }, [user]);

  /* ================= ACTIONS ================= */

  async function saveExpense(rawText) {
    const match = rawText.match(/(\d+([.,]\d+)?)/);
    if (!match) return;

    const value = Number(match[1].replace(",", "."));
    const isIncome = rawText.toLowerCase().includes("recebi");

    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      text: rawText,
      amount: isIncome ? value : -value,
      type: isIncome ? "income" : "expense",
      createdAt: serverTimestamp(),
      user: user.email,
    });
  }

  async function sendExpense(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const parsed = parseInstallment(text);
    if (parsed) {
      setPendingText(text);
      setInstallmentData(parsed);
      setShowInstallmentModal(true);
      setText("");
      return;
    }

    await saveExpense(text);
    setText("");
  }

  async function confirmInstallment(extraData) {
    await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
      text: pendingText,
      amount:
        -extraData.installments.total *
        extraData.installments.value,
      type: "expense",
      installments: extraData.installments,
      createdAt: serverTimestamp(),
      user: user.email,
    });

    setShowInstallmentModal(false);
    setInstallmentData(null);
    setPendingText("");
  }

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
          <strong>FinChat Family</strong>
          <div style={styles.headerActions}>
            <button onClick={() => setShowFilters(true)}>🔍</button>
            <button onClick={() => setShowCategories(true)}>🗂️</button>
            <button onClick={goInstallments}>💳</button>
            <button onClick={goReport}>📊</button>
            <button onClick={goSettings}>⚙️</button>
            <button onClick={() => signOut(auth)}>Sair</button>
          </div>
        </header>

        <div style={styles.chat}>
          {expenses.map((e) => (
            <div
              key={e.id}
              style={{
                ...styles.bubble,
                alignSelf:
                  e.user === user.email ? "flex-end" : "flex-start",
              }}
            >
              {e.type === "emoji" ? (
                <div style={{ fontSize: 28 }}>{e.emoji}</div>
              ) : (
                <>
                  <div>{e.text}</div>
                  <strong>R$ {Math.abs(e.amount).toFixed(2)}</strong>

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
          onClose={() => setEditExpense(null)}
        />
      )}

      {showFilters && (
        <FiltersModal onClose={() => setShowFilters(false)} />
      )}

      {showCategories && (
        <CategoryModal onClose={() => setShowCategories(false)} />
      )}

      {showInstallmentModal && installmentData && (
        <InstallmentModal
          data={installmentData}
          onConfirm={confirmInstallment}
          onCancel={() => setShowInstallmentModal(false)}
        />
      )}
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    height: "100vh",
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
  headerActions: { display: "flex", gap: 6 },
  chat: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  bubble: {
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: 12,
    background: "#DCF8C6",
    position: "relative",
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: 8,
    borderTop: "1px solid #ddd",
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
};
