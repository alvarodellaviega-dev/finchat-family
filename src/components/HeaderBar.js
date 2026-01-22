import { signOut } from "firebase/auth";
import { auth } from "../firebase";

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
      <strong>FinChat Family</strong>

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
