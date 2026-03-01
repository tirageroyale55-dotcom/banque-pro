import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ForgotId() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await api("/auth/send-personal-id", "POST", { email });

      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(res.message || "Email incorrect");

        if (newAttempts >= 3) {
          // après 3 tentatives, retour à home
          navigate("/");
        }
        return;
      }

      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <div className="apply-bg forgot-page">
      <div className="apply-card forgot-card">
        <h2>Récupération de l'identifiant</h2>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn-solid">Envoyer l'identifiant</button>
          </form>
        ) : (
          <div>
            <p>Identifiant personnel envoyé avec succès !</p>
            <button className="btn-solid" onClick={() => navigate("/")}>
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}