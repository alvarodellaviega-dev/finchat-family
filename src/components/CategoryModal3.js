import { addDoc, deleteDoc, doc, collection } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export default function CategoryModal({
  categories,
  expenses,
  newCategory,
  setNewCategory,
  onSelectCategory,
  onClose,
}) {
  async function handleAdd() {
    if (!newCategory.trim()) return;

    await addDoc(
      collection(db, "families", FAMILY_ID, "categories"),
      { name: newCategory.trim() }
    );

    setNewCategory("");
  }

  async function handleDelete(category) {
    const used = expenses.some(
      (e) => e.category === category.name
    );

    if (
      used &&
      !window.confirm(
        "Essa categoria já foi usada. Deseja excluir mesmo assim?"
      )
    ) {
      return;
    }

    await deleteDoc(
      doc(
        db,
        "families",
        FAMILY_ID,
        "categories",
        category.id
      )
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          width: "90%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3>Categorias</h3>

        {categories.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => onSelectCategory(c.name)}
            >
              {c.name}
            </span>

            <button onClick={() => handleDelete(c)}>
              🗑️
            </button>
          </div>
        ))}

        <input
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button onClick={handleAdd}>Adicionar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
