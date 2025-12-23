// FinChat Family
// File: InstallmentBubble.js
// Version: 1.5.3
// Scope: Refinamento da exibição de parcelamentos no chat
// ⚠️ NÃO acessa Firestore
// ⚠️ NÃO altera saldo
// ⚠️ NÃO altera Home.js

import React from "react";

/**
 * Calcula a parcela atual com base na data
 */
function getCurrentInstallment(installments, now) {
  const startIndex =
    installments.startYear * 12 + installments.startMonth;
  const currentIndex =
    now.getFullYear() * 12 + now.getMonth();

  return currentIndex - startIndex + 1;
}

export default function InstallmentBubble({ expense }) {
  const { installments } = expense;
  const now = new Date();

  // 🔒 Segurança
  if (!installments) return null;
  if (
    installments.startMonth == null ||
    installments.startYear == null
  ) {
    return null;
  }

  const current = getCurrentInstallment(installments, now);

  // ❌ parcela futura
  if (current < 1) return null;

  // ❌ parcelamento encerrado
  if (current > installments.total) return null;

  // 🔹 cálculo do mês de referência
  const rawMonth = installments.startMonth + current;
  const refYear =
    rawMonth > 11
      ? installments.startYear + Math.floor(rawMonth / 12)
      : installments.startYear;

  const refMonth = ((rawMonth % 12) + 1)
    .toString()
    .padStart(2, "0");

  return (
    <div
      style={{
        marginTop: 6,
        paddingTop: 6,
        borderTop: "1px dashed rgba(0,0,0,0.25)",
        fontSize: 13,
        opacity: 0.95,
      }}
    >
      <div>
        💳 {installments.card || "Cartão"} · (
        {current}/{installments.total})
      </div>

      <div>
        Ref: {refMonth}/{refYear}
      </div>

      <strong>
        R$ {installments.value.toFixed(2)}
      </strong>
    </div>
  );
}
