// FinChat Family
// Version: 1.6.2
// File: Home.js
// Scope: Base segura + UX fino do filtro (dentro da lupa)

/* =========================================================
 * 1. IMPORTS
 * ======================================================= */
import { useEffect, useState, useRef } from "react";
import { auth } from "./firebase";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

/* =========================================================
 * 3. COMPONENTS
 * ======================================================= */
import EditExpenseModal from "./components/EditExpenseModal";
import CategoryModal from "./components/CategoryModal";
import FiltersModal from "./components/FiltersModal";
import InstallmentModal from "./InstallmentModal";
import InstallmentBubble from "./components/InstallmentBubble";
import CategoryDetailsModal from "./components/CategoryDetailsModal";
import EmojiPicker from "./components/EmojiPicker";

/* =========================================================
 * 2. UTILS / HELPERS
 * ======================================================= */
import { calculateMonthlyImpact } from "./utils/calculateMonthlyImpact";
import { parseInstallment } from "./installmentsParser";
/* =========================================================
 * 4. FIREBASE CONFIG
 * ======================================================= */
const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

/* =========================================================
 * 5. CONSTANTS
 * ======================================================= */
const DEFAULT_CATEGORIES = [
  "Mercado",
  "Aluguel",
  "Lazer",
  "Transporte",
  "Saúde",
  "Contas",
  "Outros",
];

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

/* =======================================================
 * 5.1 LIMITES POR CATEGORIA (B3)
 * ===================================================== */
const CATEGORY_LIMITS = {
  Mercado: 800,
  Aluguel: 1500,
  Lazer: 400,
  Transporte: 300,
  Saúde: 300,
  Contas: 600,
  Outros: 300,
};
/* =========================================================
 * 6. COMPONENT
 * ======================================================= */
export default function Home({
  goReport,
  goInstallments,
  goSettings,
  appVersion,
}) {

  /* -------------------------------------------------------
   * 6.1 REFS & USER
   * ----------------------------------------------------- */
  const user = auth.currentUser;
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const now = new Date();

  /* -------------------------------------------------------
   * 6.2 STATE — CORE
   * ----------------------------------------------------- */
  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  /* -------------------------------------------------------
   * 6.3 STATE — FILTERS
   * ----------------------------------------------------- */
  const [typeFilter, setTypeFilter] = useState("all");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* -------------------------------------------------------
   * 6.4 STATE — CATEGORIES
   * ----------------------------------------------------- */
  const [showCategories, setShowCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  /* -------------------------------------------------------
   * 6.5 STATE — INSTALLMENTS
   * ----------------------------------------------------- */
  const [installmentData, setInstallmentData] = useState(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [pendingText, setPendingText] = useState("");
  /* =======================================================
   * 7. EFFECTS
   * ===================================================== */

  useEffect(() => {
    const ref = collection(db, "families", FAMILY_ID, "categories");

    getDocs(ref).then((snap) => {
      if (snap.empty) {
        DEFAULT_CATEGORIES.forEach((name) =>
          addDoc(ref, { name })
        );
      }
    });

    return onSnapshot(query(ref, orderBy("name")), (snap) => {
      setCategories(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "families", FAMILY_ID, "expenses"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      setExpenses(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    });
  }, [user]);

  /* =======================================================
   * 8. HELPERS
   * ===================================================== */
  function detectCategory(text) {
    const t = text.toLowerCase();
    if (t.includes("uber") || t.includes("gasolina")) return "Transporte";
    if (t.includes("ifood") || t.includes("lanche")) return "Lazer";
    if (t.includes("mercado")) return "Mercado";
    if (t.includes("aluguel")) return "Aluguel";
    if (t.includes("luz") || t.includes("agua")) return "Contas";
    return "Outros";
  }

/* =======================================================
 * 9. ACTIONS
 * ===================================================== */

async function saveNormalExpense(rawText) {
  const match = rawText.match(/(\d+([.,]\d+)?)/);
  if (!match) return;

  let amount = Number(match[1].replace(",", "."));
  const lower = rawText.toLowerCase();

  const isIncome = [
    "ganhei",
    "recebi",
    "salário",
    "salario",
    "pix",
    "entrada",
    "+",
  ].some((w) => lower.includes(w));

  amount = isIncome ? Math.abs(amount) : -Math.abs(amount);

  await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
    text: rawText,
    amount,
    category: detectCategory(rawText),
    user: user.email,
    createdAt: serverTimestamp(),
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

  await saveNormalExpense(text);
  setText("");
}

async function confirmInstallment(extraData) {
  await addDoc(collection(db, "families", FAMILY_ID, "expenses"), {
    text: pendingText,
    amount:
      -extraData.installments.total *
      extraData.installments.value,
    category: detectCategory(pendingText),
    user: user.email,
    createdAt: serverTimestamp(),
    paymentType: extraData.paymentType,
    installments: extraData.installments,
  });

  setShowInstallmentModal(false);
  setInstallmentData(null);
  setPendingText("");
}

async function cancelInstallment() {
  await saveNormalExpense(pendingText);
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




  /* =======================================================
   * 10. FILTERS / CALCULATIONS
   * ===================================================== */
  const filtered = expenses.filter((e) => {
    if (!e.createdAt) return false;
    const d = e.createdAt.toDate();
    if (typeFilter === "income" && e.amount < 0) return false;
    if (typeFilter === "expense" && e.amount > 0) return false;
    if (d.getFullYear() !== year) return false;
    if (d.getMonth() !== month) return false;
    if (day && d.getDate() !== Number(day)) return false;
    return true;
  });

  const balance = filtered.reduce(
    (sum, e) => sum + calculateMonthlyImpact(e, month, year),
    0
  );


/* =======================================================
 * 11. UI
 * ===================================================== */
return (
  <>
    {/* ================= CONTAINER PRINCIPAL ================= */}
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

      <div style={styles.balance}>
        Saldo: R$ {balance.toFixed(2)} · v{appVersion}
      </div>

      {/* ================= CHAT ================= */}
      <div style={styles.chat}>
        {filtered.map((e) => {
          const isMine = e.user === user.email;

          if (e.type === "emoji") {
            return (
              <div
                key={e.id}
                style={{
                  ...styles.bubble,
                  ...(isMine ? styles.bubbleMine : styles.bubbleOther),
                  fontSize: 32,
                  textAlign: "center",
                }}
              >
                {e.emoji}
              </div>
            );
          }

          return (
            <div
              key={e.id}
              style={{
                ...styles.bubble,
                ...(isMine ? styles.bubbleMine : styles.bubbleOther),
              }}
            >
              <div>{e.text}</div>

              <strong>R$ {Math.abs(e.amount).toFixed(2)}</strong>

              {e.installments && (
                <InstallmentBubble expense={e} isMine={isMine} />
              )}

              <button
                style={styles.editButton}
                onClick={() => setEditExpense(e)}
              >
                ✏️
              </button>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <form onSubmit={sendExpense} style={styles.inputBar}>
        <span
          style={styles.iconButton}
          onClick={() => setShowEmojiPicker(true)}
        >
          😊
        </span>

        <span
          style={styles.iconButton}
          onClick={() => fileRef.current.click()}
        >
          📷
        </span>

        <input ref={fileRef} type="file" hidden />

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

    {/* ================= EMOJI PICKER ================= */}
    {showEmojiPicker && (
      <EmojiPicker
        onSelect={sendEmoji}
        onClose={() => setShowEmojiPicker(false)}
      />
    )}

    {/* ================= MODAL FILTROS ================= */}
    {showFilters && (
      <FiltersModal
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        MONTHS={MONTHS}
        onClose={() => setShowFilters(false)}
      />
    )}

    {/* ================= MODAL CATEGORIAS ================= */}
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
          setShowCategoryDetails(true);
          setShowCategories(false);
        }}
      />
    )}

    {/* ================= MODAL DETALHE DA CATEGORIA ================= */}
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

    {/* ================= MODAL EDITAR LANÇAMENTO ================= */}
    {editExpense && (
      <EditExpenseModal
        expense={editExpense}
        FAMILY_ID={FAMILY_ID}
        onClose={() => setEditExpense(null)}
      />
    )}

    {/* ================= MODAL PARCELAMENTO ================= */}
    {showInstallmentModal && installmentData && (
      <InstallmentModal
        data={installmentData}
        onConfirm={confirmInstallment}
        onCancel={cancelInstallment}
      />
    )}
  </>
);
}

/* =======================================================
 * 12. STYLES
 * ===================================================== */
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

  headerActions: {
    display: "flex",
    gap: 6,
  },

  balance: {
    padding: 10,
    background: "#DCF8C6",
  },

  chat: {
    flex: 1,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
    position: "relative",
  },

  bubbleMine: {
    alignSelf: "flex-end",
    background: "#DCF8C6",
  },

  bubbleOther: {
    alignSelf: "flex-start",
    background: "#fff",
  },

  editButton: {
    position: "absolute",
    bottom: 4,
    right: 6,
    background: "transparent",
    border: "none",
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

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modalCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
};

