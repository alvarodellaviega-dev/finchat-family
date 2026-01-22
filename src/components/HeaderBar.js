import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const APP_VERSION = "v2.0.0";

export default function HeaderBar({
  goReport,
  goInstallments,
  goSettings,
  onFilter,
  onCategories,
}) {
  return (
    <header
      style={{
        background: "#075E54",
        color: "#fff",
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <strong>FinChat Family</strong>
        <span style={{ fontSize: 11, opacity: 0.7 }}>
          {APP_VERSION}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onFilter}>🔍</button>
        <button onClick={onCategories}>🗂️</button>
        <button onClick={goInstallments}>📆</button>
        <button onClick={goReport}>📊</button>
        <button onClick={goSettings}>⚙️</button>
        <button onClick={() => signOut(auth)}>Sair</button>
      </div>
    </header>
  );
}
