import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // 🔹 Vérifier identifiant
  const handleIdSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api("/auth/check-id", "POST", { personalId });

      if (!res.exists) {
        setError("Identifiant introuvable");
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Erreur de vérification");
    }
  };

  // 🔹 Connexion PIN
  const handleLogin = async () => {
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
      setError("Code PIN incorrect");

      if (newAttempts >= 3) {
        setError("3 tentatives échouées. Veuillez réinitialiser votre accès.");
      }
    }
  };

  // 🔹 Clavier PIN
  const addDigit = (num) => {
    if (pin.length < 5) {
      setPin(pin + num);
    }
  };

  const removeDigit = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="login-container">

      {/* 🔥 IMAGE HAUT (hors card) */}
      <div className="login-hero">
        <img
          src="/bank-woman.png"
          alt="bank"
          className="login-image"
        />
      </div>

      {/* 🔥 CARD */}
      <div className="card login-card">

        {/* 🔹 STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleIdSubmit}>
            <div className="bank-icon">🏦</div>

            <h2>Connexion sécurisée</h2>

            <input
              name="personalId"
              placeholder="Identifiant personnel"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <div className="login-actions">
              <a href="/forgot-id">Identifiant oublié ?</a>

              <button type="submit">Continuer →</button>
            </div>
          </form>
        )}

        {/* 🔹 STEP 2 */}
        {step === 2 && (
          <div className="pin-container">

            <div className="bank-icon">🏦</div>

            <h2>Saisir votre code PIN</h2>

            {/* 🔢 AFFICHAGE PIN */}
            <div className="pin-display">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="dot">
                  {pin[i] ? "●" : "○"}
                </span>
              ))}
            </div>

            {error && <p className="error">{error}</p>}

            {/* 🔢 CLAVIER */}
            <div className="keypad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => addDigit(n)}>
                  {n}
                </button>
              ))}

              <button onClick={removeDigit}>⌫</button>
              <button onClick={() => addDigit(0)}>0</button>
              <button
                onClick={handleLogin}
                disabled={pin.length !== 5}
              >
                ✔
              </button>
            </div>

            {/* 🔗 LIENS */}
            <div className="login-links">
              {attempts < 3 ? (
                <a href="/forgot-pin">Code PIN oublié ?</a>
              ) : (
                <a href="/reset-access">
                  Réinitialiser mon accès
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}