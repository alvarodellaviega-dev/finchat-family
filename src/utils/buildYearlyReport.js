import { calculateMonthlyImpact } from "./calculateMonthlyImpact";

export function buildYearlyReport(expenses, year) {
  const months = Array.from({ length: 12 }, (_, m) => ({
    month: m,
    income: 0,
    expenses: 0,
    balance: 0,
  }));

  expenses.forEach((e) => {
    for (let m = 0; m < 12; m++) {
      const impact = calculateMonthlyImpact(e, m, year);

      if (impact === 0) continue;

      if (impact > 0) {
        months[m].income += impact;
      } else {
        months[m].expenses += Math.abs(impact);
      }

      months[m].balance += impact;
    }
  });

  return months;
}
