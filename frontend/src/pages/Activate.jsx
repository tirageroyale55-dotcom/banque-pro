import { useState } from "react";
import { api } from "../services/api";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    setError(null);

    const data = {
      token,
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
      pin: e.target.pin.value
    };

    try {
      const res = await api("/auth/activate", "POST", data);
      window.location = "/login";
    } catch (err) {
      setError(err.message || "Erreur activation");
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Activation du compte</h2>

      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        required
      />

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmer mot de passe"
        required
      />

      <input
        name="pin"
        placeholder="Code PIN (5 chiffres)"
        required
      />

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}

      <button>Activer</button>
    </form>
  );
}

