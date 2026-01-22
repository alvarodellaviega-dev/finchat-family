// src/utils/dateUtils.js

export function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatChatDate(date) {
  const today = new Date();
  const d = new Date(date);

  const isToday = d.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    d.toDateString() === yesterday.toDateString();

  if (isToday) return "Hoje";
  if (isYesterday) return "Ontem";

  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}
