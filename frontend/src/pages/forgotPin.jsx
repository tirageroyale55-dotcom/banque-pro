import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ForgotPin() {
  const navigate = useNavigate();
  const [personalId, setPersonalId] = useState("");
  const [password, setPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Vérifier le mot de passe
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/auth/verify-password", "POST", {
        personalId,
        password
      });

      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError("Mot de passe incorrect");

        if (newAttempts >= 5) {
          setError(
            "Compte temporairement bloqué. Veuillez contacter l'administrateur."
          );
          return;
        }
        return;
      }

      setStep(2);
      setError("");
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  // Changer le PIN
  const handleChangePin = async () => {
    if (!/^\d{5}$/.test(newPin)) {
      setError("Le PIN doit contenir 5 chiffres");
      return;
    }
    if (newPin !== confirmPin) {
      setError("Les PIN ne correspondent pas");
      return;
    }

    try {
      const res = await api("/auth/change-pin", "POST", { personalId, pin: newPin });
      if (res.ok) {
        alert("Code PIN changé avec succès !");
        navigate("/login");
      } else {
        setError("Erreur lors du changement du PIN");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <div className="apply-bg forgot-page">
      <div className="apply-card forgot-card">
        <h2>Réinitialisation du code PIN</h2>

        {step === 1 && (
          <form onSubmit={handleVerify}>
            <input
              placeholder="Identifiant personnel"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn-solid">Vérifier</button>
          </form>
        )}

        {step === 2 && (
          <div>
            <input
              placeholder="Nouveau PIN (5 chiffres)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <input
              placeholder="Confirmer PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn-solid" onClick={handleChangePin}>
              Changer PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}