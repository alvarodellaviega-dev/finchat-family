// FinChat Family
// Screen: CardsSettings
// Scope: Gestão de cartões (isolada)
// Status: BLINDADO • alinhado com useCards • iOS safe

import { useState } from "react";
import { useCards } from "../hooks/useCards";

export default function CardsSettings({ goBack }) {
  const { cards, loadingCards, addCard, toggleCard } = useCards();

  const [name, setName] = useState("");
  const [type, setType] = useState("debit");

  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  async function handleAdd() {
    if (!name.trim()) return;

    if (type === "credit") {
      if (!limit || !closingDay || !dueDay) {
        alert("Preencha limite, fechamento e vencimento.");
        return;
      }
    }

    await addCard({
      name,
      type,
      limit,
      closingDay,
      dueDay,
    });

    setName("");
    setLimit("");
    setClosingDay("");
    setDueDay("");
    setType("debit");
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={goBack}>⬅️</button>
        <strong>Cartões</strong>
        <span />
      </header>

      {/* ===== FORM ===== */}
      <div style={styles.card}>
        <h3>Novo cartão</h3>

        <input
          placeholder="Nome do cartão"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="debit">Débito</option>
          <option value="credit">Crédito</option>
        </select>

        {type === "credit" && (
          <>
            <input
              type="number"
              placeholder="Limite"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />

            <input
              type="number"
              placeholder="Dia de fechamento (1–31)"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
            />

            <input
              type="number"
              placeholder="Dia de vencimento (1–31)"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            />
          </>
        )}

        <button onClick={handleAdd}>Adicionar cartão</button>
      </div>

      {/* ===== LISTA ===== */}
      <div style={styles.list}>
        <h3>Cartões cadastrados</h3>

        {loadingCards && <p>Carregando...</p>}

        {cards.map((c) => (
          <div key={c.id} style={styles.item}>
            <div>
              <strong>{c.name}</strong>

              <div style={styles.sub}>
                {c.type === "debit" ? "Débito" : "Crédito"}
              </div>

              {c.type === "credit" && (
                <div style={styles.sub}>
                  Limite: R$ {Number(c.limit).toFixed(2)} ·
                  Fecha: {c.closingDay} ·
                  Vence: {c.dueDay}
                </div>
              )}
            </div>

            <button
              onClick={() => toggleCard(c.id, !c.active)}
            >
              {c.active ? "✅" : "🚫"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  card: {
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  item: {
    background: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sub: {
    fontSize: 12,
    opacity: 0.7,
  },
};

