import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const APP_VERSION = "v2.0.1";

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
      {/* 🔰 TÍTULO + VERSÃO */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <strong>FinChat Family</strong>
        <span
          style={{
            fontSize: 11,
            opacity: 0.7,
          }}
        >
          {APP_VERSION}
        </span>
      </div>

      {/* 🔘 AÇÕES */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onFilter} title="Filtros">🔍</button>
        <button onClick={onCategories} title="Categorias">🗂️</button>
        <button onClick={goInstallments} title="Parcelamentos">📆</button>
        <button onClick={goReport} title="Relatórios">📊</button>
        <button onClick={goSettings} title="Configurações">⚙️</button>
        <button onClick={() => signOut(auth)}>Sair</button>
      </div>
    </header>
  );
}
