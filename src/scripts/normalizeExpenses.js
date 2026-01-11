/**
 * Script: normalizeExpenses.js
 * Objetivo:
 * - Corrigir lançamentos antigos
 * - Garantir:
 *   - type (income | expense)
 *   - paymentMethod (debit | credit | null)
 *   - sinal correto do amount
 *   - category válida
 *
 * Executar com:
 * node scripts/normalizeExpenses.js
 */

const admin = require("firebase-admin");
const path = require("path");

// 🔐 Carrega a chave do service account (CommonJS)
const serviceAccount = require(path.resolve(
  __dirname,
  "../serviceAccountKey.json"
));

// 🔥 Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const FAMILY_ID = "finchat-family-main";

async function normalize() {
  const ref = db
    .collection("families")
    .doc(FAMILY_ID)
    .collection("expenses");

  const snap = await ref.get();

  console.log(`📦 Encontrados ${snap.size} lançamentos`);

  let fixed = 0;

  for (const docSnap of snap.docs) {
    const e = docSnap.data();
    const update = {};

    // ===== type =====
    if (!e.type) {
      update.type = e.amount > 0 ? "income" : "expense";
    }

    // ===== paymentMethod =====
    if (update.type === "income") {
      update.paymentMethod = null;
    } else if (!e.paymentMethod) {
      update.paymentMethod = "debit";
    }

    // ===== sinal do amount =====
    if (update.type === "expense" && e.amount > 0) {
      update.amount = -Math.abs(e.amount);
    }

    if (update.type === "income" && e.amount < 0) {
      update.amount = Math.abs(e.amount);
    }

    // ===== category =====
    if (
      update.type === "expense" &&
      (!e.category || e.category === "")
    ) {
      update.category = "Outros";
    }

    if (Object.keys(update).length > 0) {
      await ref.doc(docSnap.id).update(update);
      fixed++;
      console.log(`✅ Corrigido: ${docSnap.id}`);
    }
  }

  console.log(
    `🎉 Normalização finalizada. ${fixed} documentos corrigidos.`
  );
  process.exit(0);
}

normalize().catch((err) => {
  console.error("❌ Erro ao normalizar:", err);
  process.exit(1);
});

