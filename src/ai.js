export function analyzeExpense(text) {
  const t = text.toLowerCase();

  if (t.includes("mercado") || t.includes("super"))
    return { category: "Alimentação" };

  if (t.includes("uber") || t.includes("99"))
    return { category: "Transporte" };

  if (t.includes("aluguel") || t.includes("luz"))
    return { category: "Casa" };

  if (t.includes("salário"))
    return { category: "Entrada" };

  return { category: "Outros" };
}
