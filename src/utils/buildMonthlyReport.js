import { calculateMonthlyImpact } from "./calculateMonthlyImpact";

export function buildMonthlyReport(expenses, month, year) {
  let income = 0;
  let debitExpenses = 0;
  let installments = 0;
  let balance = 0;

  const byCategory = {};
  const byPayment = {};

  expenses.forEach((e) => {
    const impact = calculateMonthlyImpact(e, month, year);
    if (impact === 0) return;

    balance += impact;

    // ENTRADAS
    if (impact > 0) {
      income += impact;
      return;
    }

    // SAÍDAS
    const abs = Math.abs(impact);

    if (
      e.paymentMethod === "credit" &&
      e.installments
    ) {
      installments += abs;
      byPayment["Crédito parcelado"] =
        (byPayment["Crédito parcelado"] || 0) + abs;
    } else {
      debitExpenses += abs;

      const key =
        e.paymentMethod === "credit"
          ? "Crédito à vista"
          : "Débito";

      byPayment[key] = (byPayment[key] || 0) + abs;

      if (e.category) {
        byCategory[e.category] =
          (byCategory[e.category] || 0) + abs;
      }
    }
  });

  return {
    income,
    debitExpenses,
    installments,
    balance,
    byCategory,
    byPayment,
  };
}

