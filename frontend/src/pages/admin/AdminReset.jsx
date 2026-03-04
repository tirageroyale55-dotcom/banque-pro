import { useState } from "react";
import { api } from "../../services/api";

export default function AdminReset() {
  const [personalId, setPersonalId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api("/admin-send-reset", "POST", { personalId });
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
            id="personalId"
            name="personalId"
            placeholder="Identifiant personnel"
            value={personalId}
            onChange={(e) => setPersonalId(e.target.value)}
            required
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="btn-right">
            <button className="btn-solid">
              Envoyer lien de réinitialisation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}