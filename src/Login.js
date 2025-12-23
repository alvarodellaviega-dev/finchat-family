import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setMessage("Email ou senha inválidos");
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setMessage("Digite seu email para redefinir a senha");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📩 Email de redefinição enviado");
    } catch (err) {
      setMessage("Erro ao enviar email de redefinição");
    }
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h2>FinChat Family</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
          }}
        >
          Entrar
        </button>
      </form>

      <button
        onClick={handleResetPassword}
        style={{
          marginTop: 10,
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
        }}
      >
        Esqueci minha senha
      </button>

      {message && (
        <p style={{ marginTop: 15 }}>
          {message}
        </p>
      )}
    </div>
  );
}
