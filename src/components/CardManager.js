import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function CardManager({ db, FAMILY_ID, cards, onClose }) {
  const [nome, setNome] = useState("");

  // funções do cartão (pode ser híbrido)
  const [debito, setDebito] = useState(true);
  const [credito, setCredito] = useState(false);

  // campos de crédito
  const [limite, setLimite] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [fechamento, setFechamento] = useState("");

  async function createCard() {
    if (!nome.trim()) return alert("Nome do cartão é obrigatório");

    if (!debito && !credito) {
      return alert("Selecione ao menos uma função (débito ou crédito)");
    }

    if (credito && (!limite || !vencimento || !fechamento)) {
      return alert("Preencha todos os dados do crédito");
    }

    await addDoc(collection(db, "families", FAMILY_ID, "cards"), {
      nome: nome.trim(),
      funcoes: {
        debito,
        credito,
      },
      limite: credito ? Number(limite) : null,
      saldoUtilizado: credito ? 0 : null,
      vencimento: credito ? Number(vencimento) : null,
      fechamento: credito ? Number(fechamento) : null,
      ativo: true,
      createdAt: serverTimestamp(),
    });

    // reset
    setNome("");
    setDebito(true);
    setCredito(false);
    setLimite("");
    setVencimento("");
    setFechamento("");
  }

  async function toggleActive(card) {
    await updateDoc(
      doc(db, "families", FAMILY_ID, "cards", card.id),
      { ativo: !card.ativo }
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Gestão de Cartões</h3>

        {/* FORM */}
        <div style={styles.form}>
          <input
            placeholder="Nome do cartão"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          {/* FUNÇÕES */}
          <div style={styles.functions}>
            <label>
              <input
                type="checkbox"
                checked={debito}
                onChange={(e) => setDebito(e.target.checked)}
              />
              Débito
            </label>

            <label>
              <input
                type="checkbox"
                checked={credito}
                onChange={(e) => setCredito(e.target.checked)}
              />
              Crédito
            </label>
          </div>

          {/* CAMPOS DE CRÉDITO */}
          {credito && (
            <>
              <input
                type="number"
                placeholder="Limite do crédito"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
              />
              <input
                type="number"
                placeholder="Dia do fechamento"
                value={fechamento}
                onChange={(e) => setFechamento(e.target.value)}
              />
              <input
                type="number"
                placeholder="Dia do vencimento"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </>
          )}

          <button onClick={createCard}>Adicionar cartão</button>
        </div>

        {/* LISTA */}
        <div style={styles.list}>
          {cards.map((card) => (
            <div key={card.id} style={styles.card}>
              <div>
                <strong>{card.nome}</strong>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {card.funcoes?.debito && "Débito "}
                  {card.funcoes?.credito && "Crédito"}
                </div>
              </div>

              <button onClick={() => toggleActive(card)}>
                {card.ativo ? "Desativar" : "Ativar"}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  functions: {
    display: "flex",
    gap: 12,
    fontSize: 14,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 10,
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    background: "#f4f4f4",
    padding: 8,
    borderRadius: 6,
  },
};
