// FinChat Family
// Version: 1.6.2
// File: App.js
// Scope: Navegação central + idioma global (seguro)

import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Home from "./Home";
import Report from "./Report";
import Installments from "./Installments";
import Settings from "./Settings";
import Login from "./Login";

// 🔧 MIGRAÇÃO
import { migrateExpenses } from "./scripts/migrateExpenses";

const APP_VERSION = "1.6.99-TESTE";


export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");

  // 🌍 idioma global
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "pt"
  );

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) return <Login />;

  if (screen === "settings") {
    return (
      <Settings
        goBack={() => setScreen("home")}
        setGlobalLanguage={setLanguage}
      />
    );
  }

  if (screen === "report") {
    return (
      <Report
        month={month}
        year={year}
        goBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "installments") {
    return <Installments goBack={() => setScreen("home")} />;
  }

  // 🟢 HOME (COM BOTÃO DE MIGRAÇÃO)
  return (
    <>
      {/* 🔧 BOTÃO TEMPORÁRIO DE MIGRAÇÃO */}
      <div style={{ padding: 10, background: "#fff3e0" }}>
        <button
          onClick={async () => {
            if (
              !window.confirm(
                "Isso vai atualizar lançamentos antigos. Deseja continuar?"
              )
            )
              return;

            await migrateExpenses();
            alert("Migração concluída ✅");
          }}
          style={{
            background: "#ff9800",
            color: "#fff",
            padding: 10,
            borderRadius: 6,
            width: "100%",
            fontSize: 16,
          }}
        >
          🔧 Migrar lançamentos antigos
        </button>
      </div>

      <Home
        appVersion={APP_VERSION}
        language={language}
        goReport={() => setScreen("report")}
        goInstallments={() => setScreen("installments")}
        goSettings={() => setScreen("settings")}
        setMonth={setMonth}
        setYear={setYear}
      />
    </>
  );
}
