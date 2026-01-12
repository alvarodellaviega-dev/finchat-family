// FinChat Family
// Hook: useInvoiceCalculator
// Scope: cálculo de faturas de cartão (sem Firestore, sem UI)
// Status: seguro • puro • reutilizável

/**
 * REGRAS:
 * - cash / debit → impacto imediato (NÃO entram em fatura)
 * - credit à vista → entra no mês do vencimento
 * - credit parcelado → cada parcela entra no mês correto
 */

export function useInvoiceCalculator({
  expenses = [],
  cards = [],
  month,
  year,
}) {
  // 🔎 util: valida mês/ano
  function isSameMonthYear(m, y) {
    return Number(m) === Number(month) && Number(y) === Number(year);
  }

  /* =====================================================
   * 1. FILTRA DESPESAS DE CRÉDITO QUE CAEM NO MÊS
   * =================================================== */
  const creditExpenses = expenses.filter((e) => {
    if (e.paymentMethod !== "credit") return false;
    if (!e.credit) return false;

    return isSameMonthYear(
      e.credit.dueMonth,
      e.credit.dueYear
    );
  });

  /* =====================================================
   * 2. AGRUPA POR CARTÃO
   * =================================================== */
  const byCard = {};

  creditExpenses.forEach((e) => {
    const cardId = e.cardId || "unknown";

    if (!byCard[cardId]) {
      byCard[cardId] = {
        total: 0,
        items: [],
      };
    }

    const value = Math.abs(Number(e.amount) || 0);

    byCard[cardId].total += value;
    byCard[cardId].items.push(e);
  });

  /* =====================================================
   * 3. MAPA FINAL COM INFO DO CARTÃO
   * =================================================== */
  const invoices = Object.entries(byCard).map(
    ([cardId, data]) => {
      const card =
        cards.find((c) => c.id === cardId) || null;

      return {
        cardId,
        cardName: card?.name || "Cartão desconhecido",
        closingDay: card?.closingDay || null,
        dueDay: card?.dueDay || null,
        limit: Number(card?.limit || 0),
        total: data.total,
        items: data.items,
        exceeded:
          card?.limit &&
          data.total > Number(card.limit),
      };
    }
  );

  /* =====================================================
   * 4. TOTAL GERAL DAS FATURAS
   * =================================================== */
  const totalInvoices = invoices.reduce(
    (sum, i) => sum + i.total,
    0
  );

  return {
    invoices,      // lista por cartão
    totalInvoices, // total geral do mês
    raw: creditExpenses,
  };
}
