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
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <h3>Categorias</h3>

        {/* LISTA */}
        {sortedCategories.map((c) => {
          const total = expenses
            .filter((e) => e.category === c.name && e.amount < 0)
            .reduce((sum, e) => sum + Math.abs(e.amount), 0);

          return (
            <div key={c.id} style={styles.row}>
              <span
                style={styles.name}
                onClick={() => onSelectCategory(c.name)}
              >
                {c.name}
                {total > 0 && (
                  <span style={styles.total}>
                    {" "}
                    — R$ {total.toFixed(2)}
                  </span>
                )}
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
                  )
                    return;

                  await deleteDoc(
                    doc(db, "families", FAMILY_ID, "categories", c.id)
                  );
                }}
              >
                🗑️
              </button>
            </div>
          );
        })}

        {/* NOVA CATEGORIA */}
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
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    cursor: "pointer",
  },
  total: {
    fontSize: 12,
    opacity: 0.7,
  },
};

