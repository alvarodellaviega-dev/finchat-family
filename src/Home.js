// src/Home.js
import HeaderBar from "./components/HeaderBar";
import ChatList from "./components/ChatList";
import InputBar from "./components/InputBar";
import EmojiPicker from "./components/EmojiPicker";
import EditExpenseModal from "./components/EditExpenseModal";

import { useExpenses } from "./hooks/useExpenses";
import { auth } from "./firebase";

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

    editExpense,
    setEditExpense,
    updateExpense,
    deleteExpense, // 🗑️ PASSO B (já preparado)

    sendExpense,
    sendEmoji,

    showEmojiPicker,
    setShowEmojiPicker,

    bottomRef,
  } = useExpenses();

  const user = auth.currentUser;

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <HeaderBar
        goReport={goReport}
        goInstallments={goInstallments}
        goSettings={goSettings}
      />

      {/* SALDO */}
      <div style={{ padding: 8 }}>
        Saldo:{" "}
        <strong>
          R$ {balance.toFixed(2)}
        </strong>
      </div>

      {/* CHAT */}
      <ChatList
        expenses={expenses}
        user={user}
        bottomRef={bottomRef}
        onEdit={setEditExpense} // ✏️ abre modal
      />

      {/* INPUT */}
      <InputBar
        text={text}
        setText={setText}
        onSend={sendExpense}
        onEmoji={() =>
          setShowEmojiPicker(!showEmojiPicker)
        }
      />

      {showEmojiPicker && (
        <EmojiPicker onSelect={sendEmoji} />
      )}

      {/* MODAL EDITAR */}
      <EditExpenseModal
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSave={updateExpense}
        onDelete={deleteExpense} // 🗑️ AGORA OK
      />
    </div>
  );
}
