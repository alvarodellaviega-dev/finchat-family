// FinChat Family
// File: installmentsParser.js
// Scope: Parser isolado para detectar parcelamentos via texto

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

export function parseInstallment(text) {
  if (!text) return null;

  const lower = text.toLowerCase();

  // 🔹 Detecta "10x", "8 x"
  const installmentMatch = lower.match(/(\d+)\s*x/);
  if (!installmentMatch) return null;

  const total = Number(installmentMatch[1]);
  if (!total || total < 2) return null;

  // 🔹 Detecta valor monetário
  const valueMatch = lower.match(/(\d+([.,]\d+)?)/);
  if (!valueMatch) return null;

  const amount = Number(valueMatch[1].replace(",", "."));
  if (!amount) return null;

  // 🔹 Detecta cartão após "no" ou "na"
  let card = null;
  const cardMatch = lower.match(/\b(?:no|na)\s+([a-z0-9\s]+)/);
  if (cardMatch) {
    card = cardMatch[1].trim();
  }

  // 🔹 Detecta mês por nome
  let startMonth = null;
  let startYear = null;

  Object.keys(MONTHS).forEach((m) => {
    if (lower.includes(m)) startMonth = MONTHS[m];
  });

  // 🔹 Detecta MM/YYYY ou MM-YYYY  ✅ (regex corrigida)
  const dateMatch = lower.match(/(\d{1,2})[/\-](\d{4})/);
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
