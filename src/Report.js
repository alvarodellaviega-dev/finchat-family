// FinChat Family
// Version: 1.6.4
// File: Report.js
// Scope: Relatórios mensais confiáveis (fonte única de verdade)

import { useEffect, useState, useMemo } from "react";
import { auth } from "./firebase";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
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

import {
  buildMonthlyReport,
  closeMonth,
} from "./utils";


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
  const [isClosed, setIsClosed] = useState(false);

  /* ================= VERIFICA SE MÊS ESTÁ FECHADO ================= */
  useEffect(() => {
    async function checkClosed() {
      const id = `${year}-${String(month + 1).padStart(2, "0")}`;
      const ref = doc(db, "families", FAMILY_ID, "closedMonths", id);
      const snap = await getDoc(ref);
      setIsClosed(snap.exists());
    }

    checkClosed();
  }, [month, year]);

  /* ================= FIRESTORE - DESPESAS ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "families", FAMILY_ID, "expenses"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsubscribe;
  }, [user]);

  /* ================= RELATÓRIOS ================= */
  const report = useMemo(
    () => buildMonthlyReport(expenses, month, year),
    [expenses, month, year]
  );

  /* 🔒 PROTEÇÃO MOBILE (Safari / iPhone) */
  if (!report) {
    return <p style={{ padding: 20 }}>Carregando relatório…</p>;
  }

  /* ================= CHARTS ================= */
  const incomeExpenseChart = [
    { name: "Entradas", value: Number(report.income || 0) },
    { name: "Saídas (débito)", value: Number(report.debitExpenses || 0) },
    { name: "Parcelas", value: Number(report.installments || 0) },
  ].filter((i) => !isNaN(i.value));

  const categoryChart = Object.entries(report.byCategory || {}).map(
    ([name, value]) => ({ name, value: Number(value || 0) })
  );

  const paymentChart = Object.entries(report.byPayment || {}).map(
    ([name, value]) => ({ name, value: Number(value || 0) })
  );

  const biggestCategory = categoryChart.reduce(
    (max, c) => (c.value > max.value ? c : max),
    { name: "-", value: 0 }
  );

  const categoryPercent =
    report.debitExpenses > 0
      ? Math.round(
          (biggestCategory.value / report.debitExpenses) * 100
        )
      : 0;

  /* ================= TOOLTIP ================= */
  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={styles.tooltip}>
        <strong>{label}</strong>
        <div>R$ {Number(payload[0].value || 0).toFixed(2)}</div>
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
            color:
              Number(report.balance || 0) >= 0 ? "#2e7d32" : "#c62828",
          }}
        >
          R$ {Number(report.balance || 0).toFixed(2)}
        </div>

        <span style={styles.balanceLabel}>saldo real do mês</span>

        {/* 🔒 FECHAMENTO DO MÊS */}
        {!isClosed ? (
          <button
            onClick={async () => {
              await closeMonth({
                familyId: FAMILY_ID,
                month,
                year,
                report,
              });
              setIsClosed(true);
              alert("Mês fechado com sucesso ✅");
            }}
            style={{ marginTop: 10 }}
          >
            🔒 Fechar mês
          </button>
        ) : (
          <p style={{ color: "#2e7d32", marginTop: 10 }}>
            🔐 Este mês já está fechado
          </p>
        )}
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
      </section>

      {/* ===== GASTOS POR CATEGORIA ===== */}
      <section style={styles.section}>
        <h3>🥧 Gastos por categoria</h3>

        {categoryChart.length === 0 ? (
          <p>Nenhuma saída no débito neste mês.</p>
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <p style={styles.insight}>
              🧾 <strong>{biggestCategory.name}</strong> concentra{" "}
              <strong>{categoryPercent}%</strong> das saídas no débito.
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
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

/* ================= ESTILOS ================= */

const styles = {
  container: { padding: 20 },
  header: { marginTop: 10, marginBottom: 20 },
  monthBalance: { fontSize: 28, fontWeight: "bold" },
  balanceLabel: { fontSize: 13, opacity: 0.7 },
  section: { marginTop: 30 },
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
