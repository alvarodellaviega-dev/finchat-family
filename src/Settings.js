// FinChat Family
// Version: 1.6.2
// File: Settings.js
// Scope: Configurações + idioma global

import { useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
} from "firebase/firestore";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export default function Settings({
  goBack,
  setGlobalLanguage,
  goCards, // 👈 ADICIONADO
}) {
  const user = auth.currentUser;

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "pt"
  );

  const userRef = doc(
    db,
    "families",
    FAMILY_ID,
    "users",
    user.uid
  );

  useEffect(() => {
    async function loadPrefs() {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, { language });
      }
    }
    loadPrefs();
    // eslint-disable-next-line
  }, []);

  async function saveLanguage(lang) {
    localStorage.setItem("language", lang);
    await setDoc(userRef, { language: lang }, { merge: true });

    if (setGlobalLanguage) {
      setGlobalLanguage(lang);
    }
  }

  async function clearHistory() {
    const ok = window.confirm(
      "Tem certeza que deseja apagar TODO o histórico?"
    );
    if (!ok) return;

    const q = query(
      collection(db, "families", FAMILY_ID, "expenses")
    );
    const snap = await getDocs(q);

    await Promise.all(
      snap.docs.map((d) =>
        deleteDoc(
          doc(db, "families", FAMILY_ID, "expenses", d.id)
        )
      )
    );

    alert("Histórico apagado.");
  }

  return (
    <div style={{ padding: 20 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>Configurações</strong>
        <button onClick={goBack}>⬅ Voltar</button>
      </header>

      <section style={{ marginTop: 20 }}>
        <h3>Idioma</h3>
        <select
          value={language}
          onChange={(e) => {
            const lang = e.target.value;
            setLanguage(lang);
            saveLanguage(lang);
          }}
        >
          <option value="pt">Português</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </section>

      {/* 👇 NOVA SEÇÃO */}
      <section style={{ marginTop: 30 }}>
        <h3>Cartões</h3>

        <button
          onClick={goCards}
          style={{
            padding: 10,
            width: "100%",
            fontSize: 16,
            borderRadius: 8,
            background: "#1976d2",
            color: "#fff",
            border: "none",
          }}
        >
          💳 Gerenciar cartões
        </button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>Dados</h3>

        <button onClick={clearHistory}>
          🗑️ Limpar histórico
        </button>
      </section>
    </div>
  );
}
