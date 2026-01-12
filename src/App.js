// FinChat Family
// Version: 1.6.2
// File: App.js
// Scope: Navegação central + idioma global (base estável)

import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Home from "./Home";
import Report from "./Report";
import Installments from "./Installments";
import Settings from "./Settings";
import Login from "./Login";
import CardsSettings from "./screens/CardsSettings";

const APP_VERSION = "1.6.2";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");

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
        goCards={() => setScreen("cards")} // 👈 AQUI
      />
    );
  }

  if (screen === "cards") {
    return (
      <CardsSettings
        goBack={() => setScreen("settings")}
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

  return (
    <Home
      appVersion={APP_VERSION}
      language={language}
      goReport={() => setScreen("report")}
      goInstallments={() => setScreen("installments")}
      goSettings={() => setScreen("settings")}
      setMonth={setMonth}
      setYear={setYear}
    />
  );
}
