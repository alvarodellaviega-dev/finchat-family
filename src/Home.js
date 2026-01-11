// FinChat Family
// Version: 1.6.2
// File: Home.js
// Scope: Base segura + UX fino do filtro (dentro da lupa)

/* =========================================================
 * 1. IMPORTS
 * ======================================================= */
import { useEffect, useState, useRef } from "react";
import { auth } from "./firebase";
import { migrateExpenses } from "./scripts/migrateExpenses";


import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import AddExpense from "./components/AddExpense";

export default function Home() {
  return (
    <div>
      <h1>FinChat Family</h1>

      <AddExpense />
    </div>
  );
}

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
import { doc, getDoc } from "firebase/firestore";
import { ensureUserAndFamily } from "./firebase";

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
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
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
   * 6.1 USER & REFS (SEM IF / RETURN AQUI)
   * ----------------------------------------------------- */
  const user = auth.currentUser;

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const now = new Date();
  const [activeFamilyId, setActiveFamilyId] = useState(null);
const [loadingFamily, setLoadingFamily] = useState(true);

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

  async function loadFamily() {
    // garante usuário + família
    await ensureUserAndFamily(user);

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      setActiveFamilyId(snap.data().activeFamilyId);
    }

    setLoadingFamily(false);
  }

  loadFamily();
}, [user]);

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

function getCategoryUsage(expense) {
  if (
    expense.type !== "expense" ||
    expense.paymentMethod !== "debit"
  )
    return null;

  const category = expense.category;
  const limit = CATEGORY_LIMITS[category];
  if (!limit) return null;

  const total = expenses
    .filter((e) => {
      if (
        e.type !== "expense" ||
        e.paymentMethod !== "debit"
      )
        return false;
      if (!e.createdAt) return false;
      const items = expenses.filter((e) => {
  if (e.type !== "expense") return false;
  if (!e.category) return false;
  if (e.category !== category) return false;
  if (!e.createdAt) return false;

  const d = e.createdAt.toDate();
  return (
    d.getMonth() === month &&
    d.getFullYear() === year
  );
});


      const d = e.createdAt.toDate();
      return (
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const percent = total / limit;

  return {
    warning: percent >= 0.8 && percent < 1,
    exceeded: percent >= 1,
  };
}


/* =======================================================
 * 9. ACTIONS
 * ===================================================== */

async function saveNormalExpense(rawText) {
  const match = rawText.match(/(\d+([.,]\d+)?)/);
  if (!match) return;

  const value = Number(match[1].replace(",", "."));
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

  const isCredit = lower.includes("credito");

  const expense = {
    text: rawText,
    amount: value, // 👈 SEMPRE positivo
    type: isIncome ? "income" : "expense",
    paymentMethod: isIncome
      ? null
      : isCredit
      ? "credit"
      : "debit",
    category: isIncome ? null : detectCategory(rawText),
    creditCardId: isCredit ? "default" : null,
    createdAt: serverTimestamp(),
    user: user.email,
  };

  await addDoc(
    collection(db, "families", FAMILY_ID, "expenses"),
    expense
  );
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
  });if (loadingFamily) {
  return <div style={{ padding: 20 }}>Carregando família...</div>;
}

if (!activeFamilyId) {
  return <div style={{ padding: 20 }}>Nenhuma família ativa</div>;
}


  const balance = filtered.reduce((sum, e) => {
  if (typeof e.amount !== "number") return sum;
  if (!e.type) return sum;

  // crédito não afeta saldo imediato
  if (e.type === "expense" && e.paymentMethod === "credit")
    return sum;

  return e.type === "income"
    ? sum + e.amount
    : sum + e.amount;
}, 0);




/* =======================================================
 * 11. UI
 * ===================================================== */

if (loadingFamily || !activeFamilyId) {
  return <div style={{ padding: 20 }}>Carregando família...</div>;
}

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

      {/* 🔧 BOTÃO TEMPORÁRIO DE MIGRAÇÃO */}
      <button
        onClick={async () => {
          if (
            !window.confirm(
              "Isso vai atualizar lançamentos antigos. Deseja continuar?"
            )
          ) return;

          await migrateExpenses();
        }}
        style={{
          margin: "10px 0",
          background: "#ff9800",
          color: "#fff",
          padding: 10,
          borderRadius: 6,
        }}
      >
        🔧 Migrar lançamentos antigos
      </button>

      <div style={styles.balance}>
        Saldo: R$ {balance.toFixed(2)} · v{appVersion}
      </div>

      {/* ================= CHAT ================= */}
      <div style={styles.chat}>
        {filtered.map((e, index) => {
          const isMine = e.user === user.email;
          const usage = getCategoryUsage(e);
          const prev = filtered[index - 1];

          const showDateSeparator =
            !prev ||
            !prev.createdAt ||
            prev.createdAt.toDate().toDateString() !==
              e.createdAt.toDate().toDateString();

          return (
            <div key={e.id} style={{ display: "flex", flexDirection: "column" }}>
              {/* … resto do seu código exatamente igual … */}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  </>
);

      {/* ================= INPUT ================= */}
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
          setShowCategoryDetails(true);
          setShowCategories(false);
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

   {editExpense && (
  <EditExpenseModal
    expense={editExpense}
    FAMILY_ID={FAMILY_ID}
    categories={categories}
    onClose={() => setEditExpense(null)}
  />
)}


    {showInstallmentModal && installmentData && (
      <InstallmentModal
        data={installmentData}
        onConfirm={confirmInstallment}
        onCancel={cancelInstallment}
      />
    )}
  </>
);}//

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
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: 16,
    position: "relative",
    wordBreak: "break-word",
  },

  bubbleMine: {
    alignSelf: "flex-end",
    background: "#DCF8C6",
    borderBottomRightRadius: 4,
  },

  bubbleOther: {
    alignSelf: "flex-start",
    background: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },

  metaInfo: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
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
  }
};
