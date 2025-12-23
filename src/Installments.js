// FinChat Family
// File: Installments.js
// Version: 1.5.4
// Scope: Painel claro de parcelamentos ativos (somente leitura)
// ⚠️ NÃO altera Firestore
// ⚠️ NÃO altera Home.js
// ⚠️ NÃO altera saldo

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

/**
 * Diferença em meses entre duas datas
 */
function diffMonths(from, to) {
  return (
    to.getFullYear() * 12 +
    to.getMonth() -
    (from.getFullYear() * 12 + from.getMonth())
  );
}

/**
 * Formata MM/YYYY
 */
function formatRef(month, year) {
  return `${String(month + 1).padStart(2, "0")}/${year}`;
}

export default function Installments({ goBack }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "families", FAMILY_ID, "expenses"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      const today = new Date();

      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (e) =>
            e.paymentType === "credito" &&
            e.installments &&
            e.installments.total > 1 &&
            e.installments.startMonth != null &&
            e.installments.startYear != null &&
            e.createdAt
        )
        .map((e) => {
          const start = new Date(
            e.installments.startYear,
            e.installments.startMonth,
            1
          );

          const current =
            diffMonths(start, today) + 1;

          // ❌ futura
          if (current < 1) return null;

          // ❌ encerrada
          if (current > e.installments.total) return null;

          const refMonth =
            e.installments.startMonth + current - 1;

          const refYear =
            refMonth > 11
              ? e.installments.startYear +
                Math.floor(refMonth / 12)
              : e.installments.startYear;

          return {
            id: e.id,
            text: e.text,
            card: e.installments.card || "Cartão",
            current,
            total: e.installments.total,
            value: e.installments.value,
            ref: formatRef(refMonth % 12, refYear),
            amount: Math.abs(e.amount),
          };
        })
        .filter(Boolean);

      setItems(data);
    });
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <strong>💳 Parcelamentos</strong>
        <button onClick={goBack}>⬅ Voltar</button>
      </header>

      {items.length === 0 && (
        <p style={styles.empty}>
          Nenhum parcelamento ativo no momento.
        </p>
      )}

      {items.map((e) => (
        <div key={e.id} style={styles.card}>
          <div style={styles.title}>{e.text}</div>

          <div style={styles.row}>
            <span>💳 {e.card}</span>
            <span>
              ({e.current}/{e.total})
            </span>
          </div>

          <div style={styles.row}>
            <span>Ref:</span>
            <strong>{e.ref}</strong>
          </div>

          <div style={styles.row}>
            <span>Parcela:</span>
            <strong>
              R$ {e.value.toFixed(2)}
            </strong>
          </div>

          <div style={styles.total}>
            Total: R$ {e.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 10,
    maxWidth: 640,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  empty: {
    opacity: 0.7,
    marginTop: 20,
  },
  card: {
    background: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
  },
  total: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.75,
  },
};
