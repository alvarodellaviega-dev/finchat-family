import pt from "./pt";
import en from "./en";
import es from "./es";

const dictionaries = { pt, en, es };

function normalizeLang(lang) {
  if (!lang) return "pt";
  return lang.toLowerCase().split("-")[0];
}

export function detectLanguage(savedLang) {
  if (savedLang && dictionaries[savedLang]) {
    return savedLang;
  }

  const browserLang = normalizeLang(navigator.language);

  if (dictionaries[browserLang]) {
    return browserLang;
  }

  return "pt"; // fallback seguro
}

export function getDictionary(lang) {
  return dictionaries[lang] || dictionaries.pt;
}
