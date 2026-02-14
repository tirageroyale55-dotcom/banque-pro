import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    setError(null);

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const res = await api("/auth/login", "POST", data);

      // Sauvegarde token
      localStorage.setItem("token", res.token);

      // 🔥 REDIRECTION SELON ROLE
      if (res.user.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      setError(err.message || "Erreur de connexion");
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Connexion</h2>

      <input
        name="personalId"
        placeholder="Identifiant personnel"
        required
      />

      <input
        name="pin"
        type="password"
        placeholder="Code PIN"
        required
      />

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}

      <button>Connexion</button>
    </form>
  );
}
