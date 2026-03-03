import { useState } from "react";
import { api } from "../../services/api";

export default function AdminReset() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api("/admin/admin-send-reset", "POST", {
        email: identifier,
      });

      setSuccess(res.message);
      setIdentifier(""); // reset champ
    } catch (err) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
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
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="btn-right">
            <button className="btn-solid" disabled={loading}>
              {loading
                ? "Envoi..."
                : "Envoyer lien de réinitialisation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}