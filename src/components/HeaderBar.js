// src/components/HeaderBar.js
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function HeaderBar({ goReport, goInstallments, goSettings }) {
  return (
    <header style={{ background: "#075E54", color: "#fff", padding: 10 }}>
      <strong>FinChat Family</strong>

      <div>
        <button onClick={goInstallments}>💳</button>
        <button onClick={goReport}>📊</button>
        <button onClick={goSettings}>⚙️</button>
        <button onClick={() => signOut(auth)}>Sair</button>
      </div>
    </header>
  );
}
