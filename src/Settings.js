// FinChat Family
// Version: 2.0.0-stable
// File: Settings.js
// Scope: Configurações + idioma global + gestão de cartões

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
  onSnapshot,
} from "firebase/firestore";

// 🔧 Gestão de Cartões
import CardManager from "./components/CardManager";

const db = getFirestore();
const FAMILY_ID = "finchat-family-main";

export default function Settings({ goBack, setGlobalLanguage }) {
  const user = auth.currentUser;

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "pt"
  );

  const [showCards, setShowCards] = useState(false);
  const [cards, setCards] = useState([]);

  const userRef = doc(
    db,
    "families",
    FAMILY_ID,
    "users",
    user.uid
  );

  /* ================= PREFS ================= */

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

  /* ================= CARDS ================= */

  useEffect(() => {
    if (!showCards) return;

    return onSnapshot(
      collection(db, "families", FAMILY_ID, "cards"),
      (snap) => {
        setCards(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      }
    );
  }, [showCards]);

  /* ================= DADOS ================= */

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

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
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

      <section style={{ marginTop: 30 }}>
        <h3>Cartões</h3>
        <button onClick={() => setShowCards(true)}>
          💳 Gestão de Cartões
        </button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>Dados</h3>
        <button onClick={clearHistory}>
          🗑️ Limpar histórico
        </button>
      </section>

      {/* MODAL DE CARTÕES */}
      {showCards && (
        <CardManager
          db={db}
          FAMILY_ID={FAMILY_ID}
          cards={cards}
          onClose={() => setShowCards(false)}
        />
      )}
    </div>
  );
}
