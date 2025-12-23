import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function CategoryModal({
  db,
  FAMILY_ID,
  categories,
  expenses,
  newCategory,
  setNewCategory,
  onClose,
  onSelectCategory,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
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

            <button
              onClick={async () => {
                const used = expenses.some(
                  (e) => e.category === c.name
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
                    c.id
                  )
                );
              }}
            >
              🗑️
            </button>
          </div>
        ))}

        <input
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button
          onClick={async () => {
            if (!newCategory.trim()) return;

            await addDoc(
              collection(db, "families", FAMILY_ID, "categories"),
              { name: newCategory.trim() }
            );

            setNewCategory("");
          }}
        >
          Adicionar
        </button>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

const styles = {
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
};
