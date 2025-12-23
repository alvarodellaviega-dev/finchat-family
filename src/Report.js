// FinChat Family
// Version: 1.6.3
// File: Report.js
// Scope: Leitura rápida + hierarquia visual + UX refinada (SEM alterar lógica)

import { useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

const COLORS = [
  "#075E54",
  "#25D366",
  "#34B7F1",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
];

export default function Report({ month, year, goBack }) {
  const user = auth.currentUser;
  const [expenses, setExpenses] = useState([]);

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
    });
  }, [user]);

  /* ================= FILTRO MÊS ================= */
  const filtered = expenses.filter((e) => {
    if (!e.createdAt) return false;
    const d = e.createdAt.toDate();
    return d.getMonth() === month && d.getFullYear() === year;
  });

  /* ================= ENTRADAS x SAÍDAS ================= */
  let incomeTotal = 0;
  let expenseTotal = 0;

  filtered.forEach((e) => {
    if (e.amount > 0) incomeTotal += e.amount;
    else expenseTotal += Math.abs(e.amount);
  });

  const incomeExpenseChart = [
    { name: "Entradas", value: incomeTotal },
    { name: "Saídas", value: expenseTotal },
  ];

  const totalMonth = incomeTotal - expenseTotal;

  /* ================= GASTOS POR CATEGORIA ================= */
  const byCategory = {};
  filtered
    .filter((e) => e.amount < 0)
    .forEach((e) => {
      byCategory[e.category] =
        (byCategory[e.category] || 0) + Math.abs(e.amount);
    });

  const categoryChart = Object.entries(byCategory).map(
    ([name, value]) => ({ name, value })
  );

  const biggestCategory = categoryChart.reduce(
    (max, c) => (c.value > max.value ? c : max),
    { name: "-", value: 0 }
  );

  const categoryPercent =
    expenseTotal > 0
      ? Math.round((biggestCategory.value / expenseTotal) * 100)
      : 0;

  /* ================= FORMA DE PAGAMENTO ================= */
  const byPayment = {};
  filtered.forEach((e) => {
    const key =
      e.paymentType === "credito" ? "Crédito" : "À vista";
    byPayment[key] = (byPayment[key] || 0) + Math.abs(e.amount);
  });

  const paymentChart = Object.entries(byPayment).map(
    ([name, value]) => ({ name, value })
  );

  /* ================= TOOLTIP ================= */
  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={styles.tooltip}>
        <strong>{label}</strong>
        <div>R$ {payload[0].value.toFixed(2)}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={goBack}>⬅ Voltar</button>

      {/* ===== CABEÇALHO ===== */}
      <div style={styles.header}>
        <h2>
          Relatório {String(month + 1).padStart(2, "0")}/{year}
        </h2>

        <div
          style={{
            ...styles.monthBalance,
            color: totalMonth >= 0 ? "#2e7d32" : "#c62828",
          }}
        >
          R$ {totalMonth.toFixed(2)}
        </div>
        <span style={styles.balanceLabel}>
          saldo do mês
        </span>
      </div>

      {/* ===== ENTRADAS x SAÍDAS ===== */}
      <section style={styles.section}>
        <h3>📊 Entradas x Saídas</h3>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={incomeExpenseChart}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>

        <p style={styles.insight}>
          {incomeTotal >= expenseTotal
            ? "✅ Você gastou menos do que ganhou."
            : "⚠️ Gastos maiores que as entradas neste mês."}
        </p>
      </section>

      {/* ===== GASTOS POR CATEGORIA ===== */}
      <section style={styles.section}>
        <h3>🥧 Gastos por categoria</h3>

        {categoryChart.length === 0 ? (
          <p>Nenhuma saída registrada.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  label
                >
                  {categoryChart.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <p style={styles.insight}>
              🧾 <strong>{biggestCategory.name}</strong> concentra{" "}
              <strong>{categoryPercent}%</strong> dos gastos.
            </p>
          </>
        )}
      </section>

      {/* ===== FORMA DE PAGAMENTO ===== */}
      <section style={styles.section}>
        <h3>💳 Forma de pagamento</h3>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={paymentChart}
              dataKey="value"
              nameKey="name"
              outerRadius={85}
              label
            >
              {paymentChart.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <p style={styles.insight}>
          💡 Crédito exige atenção para evitar parcelas acumuladas.
        </p>
      </section>
    </div>
  );
}

/* ================= ESTILOS ================= */

const styles = {
  container: {
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  monthBalance: {
    fontSize: 28,
    fontWeight: "bold",
  },
  balanceLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  section: {
    marginTop: 30,
  },
  insight: {
    marginTop: 10,
    fontSize: 14,
    background: "#f4f4f4",
    padding: 10,
    borderRadius: 8,
  },
  tooltip: {
    background: "#fff",
    padding: 8,
    borderRadius: 6,
    fontSize: 13,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
};
