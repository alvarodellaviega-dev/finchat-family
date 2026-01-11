/**
 * SCRIPT DE NORMALIZAÇÃO — FinChat Family
 * Corrige lançamentos antigos quebrados
 */

import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const FAMILY_ID = "finchat-family-main";

const DEFAULT_CATEGORIES = [
  "Mercado",
  "Aluguel",
  "Lazer",
  "Transporte",
  "Saúde",
  "Contas",
  "Outros",
];

function detectCategory(text = "") {
  const t = text.toLowerCase();
  if (t.includes("uber") || t.includes("gasolina")) return "Transporte";
  if (t.includes("ifood") || t.includes("lanche")) return "Lazer";
  if (t.includes("mercado")) return "Mercado";
  if (t.includes("aluguel")) return "Aluguel";
  if (t.includes("luz") || t.includes("agua")) return "Contas";
  return "Outros";
}

async function normalize() {
  const ref = db
    .collection("families")
    .doc(FAMILY_ID)
    .collection("expenses");

  const snap = await ref.get();

  console.log(`📦 Encontrados ${snap.size} lançamentos`);

  let updated = 0;

  for (const docSnap of snap.docs) {
    const e = docSnap.data();
    const update = {};

    // ===============================
    // 1️⃣ DEFINIR TYPE
    // ===============================
    if (!e.type) {
      update.type = e.amount > 0 ? "income" : "expense";
    }

    const type = update.type || e.type;

    // ===============================
    // 2️⃣ CORRIGIR AMOUNT
    // ===============================
    if (type === "expense" && e.amount > 0) {
      update.amount = -Math.abs(e.amount);
    }

    if (type === "income" && e.amount < 0) {
      update.amount = Math.abs(e.amount);
    }

    // ===============================
    // 3️⃣ PAYMENT METHOD
    // ===============================
    if (type === "expense") {
      update.paymentMethod =
        e.paymentMethod === "credit" ? "credit" : "debit";
    } else {
      update.paymentMethod = null;
    }

    // ===============================
    // 4️⃣ CATEGORIA
    // ===============================
    if (type === "income") {
      update.category = null;
    }

    if (type === "expense") {
      if (!e.category || !DEFAULT_CATEGORIES.includes(e.category)) {
        update.category = detectCategory(e.text);
      }
    }

    // ===============================
    // 5️⃣ APLICAR UPDATE
    // ===============================
    if (Object.keys(update).length > 0) {
      await docSnap.ref.update(update);
      updated++;
      console.log(`✅ Corrigido: ${docSnap.id}`, update);
    }
  }

  console.log(`🎉 Normalização finalizada. ${updated} documentos corrigidos.`);
}

normalize()
  .then(() => process.exit())
  .catch((err) => {
    console.error("❌ Erro:", err);
    process.exit(1);
  });
