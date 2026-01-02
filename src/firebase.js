import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzCrbBZlb0wZ1jzbWVyhC5_ScrrKLz548",
  authDomain: "finchat-8e51b.firebaseapp.com",
  projectId: "finchat-8e51b",
  storageBucket: "finchat-8e51b.firebasestorage.app",
  messagingSenderId: "579534887392",
  appId: "1:579534887392:web:196163b302d621ce3cb385",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* =====================================================
 * ENSURE USER + FAMILY (VERSÃO SEGURA)
 * ===================================================== */
export async function ensureUserAndFamily(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // 1️⃣ Se usuário NÃO existe → criar tudo
  if (!userSnap.exists()) {
    const familyId = `family_${user.uid}`;

    // cria família
    await setDoc(doc(db, "families", familyId), {
      createdAt: serverTimestamp(),
      owner: user.uid,
    });

    // cria usuário
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      activeFamilyId: familyId,
      createdAt: serverTimestamp(),
    });

    return;
  }

  // 2️⃣ Usuário existe, mas não tem família ativa (edge case)
  const data = userSnap.data();

  if (!data.activeFamilyId) {
    const familyId = `family_${user.uid}`;

    await setDoc(doc(db, "families", familyId), {
      createdAt: serverTimestamp(),
      owner: user.uid,
    });

    await setDoc(
      userRef,
      { activeFamilyId: familyId },
      { merge: true }
    );
  }
}
