import { useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import HeaderBar from "./components/HeaderBar";
import ChatList from "./components/ChatList";
import InputBar from "./components/InputBar";
import EmojiPicker from "./components/EmojiPicker";
import EditExpenseModal from "./components/EditExpenseModal";
import FiltersModal from "./components/FiltersModal";
import CategoryModal from "./components/CategoryModal";
import CategoryDetailsModal from "./components/CategoryDetailsModal";

import { useExpenses } from "./hooks/useExpenses";
import { auth } from "./firebase";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export default function Home({
  goReport,
  goInstallments,
  goSettings,
}) {
  const {
    text,
    setText,
    expenses,
    balance,
    cards,
    categories,

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
  } = useExpenses();

  const user = auth.currentUser;

  /* ================= UI STATE ================= */

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // 🔑 NOVOS ESTADOS (ESSENCIAIS)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  const [newCategory, setNewCategory] = useState("");

  // filtros
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  /* ================= CATEGORIAS ================= */

  async function handleAddCategory() {
    if (!newCategory.trim()) return;

    await addDoc(
      collection(db, "families", FAMILY_ID, "categories"),
      {
        name: newCategory.trim(),
        createdAt: new Date(),
      }
    );

    setNewCategory("");
  }

  async function handleDeleteCategory(categoryId) {
    if (!window.confirm("Excluir esta categoria?")) return;

    await deleteDoc(
      doc(db, "families", FAMILY_ID, "categories", categoryId)
    );
  }

  function handleSelectCategory(categoryName) {
    // 🔑 AGORA FUNCIONA
    setSelectedCategory(categoryName);
    setShowCategories(false);
    setShowCategoryDetails(true);
  }

  /* ================= FILTRO ================= */

  const filteredExpenses = expenses.filter((e) => {
    if (!e.createdAt?.toDate) return false;

    const d = e.createdAt.toDate();

    if (d.getMonth() !== filterMonth) return false;
    if (d.getFullYear() !== filterYear) return false;

    if (typeFilter === "income" && e.amount < 0) return false;
    if (typeFilter === "expense" && e.amount > 0) return false;

    if (categoryFilter && (e.category || "Outros") !== categoryFilter)
      return false;

    if (paymentFilter && e.paymentMethod !== paymentFilter)
      return false;

    return true;
  });

  /* ================= RENDER ================= */

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <HeaderBar
        goReport={goReport}
        goInstallments={goInstallments}
        goSettings={goSettings}
        onFilter={() => setShowFilters(true)}
        onCategories={() => setShowCategories(true)}
      />

      <div style={{ padding: 8 }}>
        Saldo: <strong>R$ {balance.toFixed(2)}</strong>
      </div>

      <ChatList
        expenses={filteredExpenses}
        user={user}
        bottomRef={bottomRef}
        onEdit={setEditExpense}
        cards={cards}
      />

      <InputBar
        text={text}
        setText={setText}
        onSend={sendExpense}
        onEmoji={() => setEmojiOpen(true)}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cards={cards}
        selectedCardId={selectedCardId}
        setSelectedCardId={setSelectedCardId}
      />

      {emojiOpen && (
        <EmojiPicker
          onSelect={(emoji) => {
            sendEmoji(emoji);
            setEmojiOpen(false);
          }}
          onClose={() => setEmojiOpen(false)}
        />
      )}

      <EditExpenseModal
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSave={updateExpense}
        onDelete={deleteExpense}
      />

      {/* 🔍 FILTROS */}
      {showFilters && (
        <FiltersModal
          month={filterMonth}
          setMonth={setFilterMonth}
          year={filterYear}
          setYear={setFilterYear}
          MONTHS={MONTHS}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories || []}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* 🗂️ LISTA DE CATEGORIAS */}
      {showCategories && (
        <CategoryModal
          categories={categories || []}
          expenses={expenses}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onSelectCategory={handleSelectCategory}
          onClose={() => setShowCategories(false)}
        />
      )}

      {/* 📂 DETALHES DA CATEGORIA */}
      {showCategoryDetails && selectedCategory && (
        <CategoryDetailsModal
          category={selectedCategory}
          expenses={expenses}
          month={filterMonth}
          year={filterYear}
          onClose={() => {
            setShowCategoryDetails(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}
