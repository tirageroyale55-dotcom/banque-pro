import { useState } from "react";
import { api } from "../../services/api";

export default function AdminReset() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api("/auth/admin-send-reset", "POST", { email });
      setSuccess(res.message);
    } catch (err) {
      setError(err.message || "Erreur serveur");
    }
  };

  return (
    <div className="apply-bg login-page">
      <div className="apply-card login-card">
        <div className="bank-icon">🏦</div>

        <h2 className="apply-title">Réinitialisation utilisateur</h2>

        <form onSubmit={handleSend}>
          <input
            placeholder="Email ou Identifiant personnel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="btn-right">
            <button className="btn-solid">Envoyer lien de réinitialisation</button>
          </div>
        </form>
      </div>
    </div>
  );
}