import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // 👉 ETAPE 1 : Vérification identifiant
  const handleIdSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api("/auth/check-id", "POST", { personalId });

      if (res.exists) {
        setStep(2);
      } else {
        setError("Identifiant introuvable");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  // 👉 ETAPE 2 : Connexion PIN
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api("/auth/login", "POST", {
        personalId,
        pin,
      });

      localStorage.setItem("token", res.token);

      if (res.user.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError("3 tentatives échouées. Réinitialisation requise.");
      } else {
        setError("Code PIN incorrect");
      }
    }
  };

  return (
    <div className="login-container">

      {/* ✅ IMAGE HAUT (hors carte) */}
      <div className="login-hero">
        <img
          src="/banking-illustration.png"
          alt="Bank illustration"
        />
      </div>

      {/* ✅ CARTE LOGIN */}
      <form
        className="card login-card"
        onSubmit={step === 1 ? handleIdSubmit : handlePinSubmit}
      >
        {/* 🔒 Icône bancaire */}
        <div className="login-icon">🏦</div>

        <h2>Connexion sécurisée</h2>

        {/* ✅ ETAPE 1 */}
        {step === 1 && (
          <>
            <input
              name="personalId"
              placeholder="Identifiant personnel"
              required
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
            />

            <div className="login-actions">
              <a href="/forgot-id" className="link">
                Identifiant oublié ?
              </a>

              <button type="submit">Continuer →</button>
            </div>
          </>
        )}

        {/* ✅ ETAPE 2 */}
        {step === 2 && (
          <>
            <div className="pin-display">
              {pin.padEnd(5, "•")}
            </div>

            <input
              type="password"
              maxLength="5"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="•••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />

            <div className="login-actions">
              {attempts < 3 ? (
                <a href="/forgot-pin" className="link">
                  Code PIN oublié ?
                </a>
              ) : (
                <a href="/reset-password" className="link danger">
                  Réinitialiser mot de passe
                </a>
              )}

              <button type="submit">Se connecter →</button>
            </div>
          </>
        )}

        {/* ❌ ERREUR */}
        {error && (
          <p className="error-msg">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}