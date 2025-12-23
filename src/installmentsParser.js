// FinChat Family
// File: installmentsParser.js
// Scope: Parser isolado para detectar parcelamentos via texto
// ⚠️ NÃO grava no Firestore
// ⚠️ NÃO altera UI

const MONTHS = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

/**
 * Retorna null se NÃO for parcelamento
 * Retorna objeto parcial se for parcelamento
 */
export function parseInstallment(text) {
  if (!text) return null;

  const lower = text.toLowerCase();

  // 🔹 Detecta "10x", "8 x", etc
  const installmentMatch = lower.match(/(\d+)\s*x/);
  if (!installmentMatch) return null;

  const total = Number(installmentMatch[1]);
  if (!total || total < 2) return null;

  // 🔹 Detecta valor (primeiro número monetário)
  const valueMatch = lower.match(/(\d+([.,]\d+)?)/);
  if (!valueMatch) return null;

  const amount = Number(valueMatch[1].replace(",", "."));
  if (!amount) return null;

  // 🔹 Detecta cartão (texto livre após "no" ou "na")
  let card = null;
  const cardMatch = lower.match(/\bno\s+([a-z0-9\s]+)|\bna\s+([a-z0-9\s]+)/);
  if (cardMatch) {
    card = (cardMatch[1] || cardMatch[2] || "").trim();
  }

  // 🔹 Detecta mês por nome
  let startMonth = null;
  let startYear = null;

  Object.keys(MONTHS).forEach((m) => {
    if (lower.includes(m)) {
      startMonth = MONTHS[m];
    }
  });

  // 🔹 Detecta MM/YYYY ou MM-YYYY
  const dateMatch = lower.match(/(\d{1,2})[\/-](\d{4})/);
  if (dateMatch) {
    startMonth = Number(dateMatch[1]) - 1;
    startYear = Number(dateMatch[2]);
  }

  return {
    total,
    amount,
    installmentValue: amount / total,
    card,
    startMonth,
    startYear,
    needsDate: startMonth === null || startYear === null,
  };
}
