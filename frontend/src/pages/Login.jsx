import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!personalId) return;
    setStep(2);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 5) {
      return setError("Le code PIN doit contenir 5 chiffres");
    }

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
        setError("3 tentatives échouées. Réinitialisez votre accès.");
      } else {
        setError(`Code incorrect (${newAttempts}/3)`);
      }
    }
  };

  return (
    <div className="login-container">
      
      {/* IMAGE HAUT */}
      <div className="login-hero">
        <img
          src="/bank-illustration.png"
          alt="Banque mobile"
        />
      </div>

      {/* CARTE */}
      <form
        className="card login-card"
        onSubmit={step === 1 ? handleIdSubmit : handlePinSubmit}
      >
        {/* LOGO */}
        <div className="bank-header">
          <span className="bank-icon">🏦</span>
          <h2>Connexion sécurisée</h2>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="personalId"
              placeholder="Identifiant personnel"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              required
            />

            <div className="login-links">
              <a href="/forgot-id">
                Identifiant personnel oublié ?
              </a>
            </div>

            <div className="btn-row">
              <button type="submit">Continuer →</button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {/* TELEPHONE PIN */}
            <div className="phone-mock">
              <div className="pin-display">
                {pin.padEnd(5, "•")}
              </div>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={5}
              placeholder="Code PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPin(value);
              }}
              required
            />

            <div className="login-links">
              <a href="/forgot-pin">Code PIN oublié ?</a>
            </div>

            {attempts >= 3 && (
              <div className="login-links">
                <a href="/reset-password">
                  Réinitialiser mot de passe
                </a>
              </div>
            )}

            {error && (
              <p className="error">{error}</p>
            )}

            <div className="btn-row">
              <button type="submit">Se connecter →</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}