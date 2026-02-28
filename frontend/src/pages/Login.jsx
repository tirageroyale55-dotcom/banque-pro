import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // ✅ Vérification identifiant
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
    } catch {
      setError("Erreur serveur");
    }
  };

  // ✅ Connexion PIN
  const handleLogin = async () => {
    if (pin.length !== 5) return;

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
        setError("3 tentatives échouées. Réinitialisation requise.");
      }
    }
  };

  // ✅ Clavier PIN
  const addDigit = (digit) => {
    if (pin.length < 5) {
      setPin(pin + digit);
    }
  };

  const removeDigit = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="login-page">

      {/* 🔥 IMAGE PREMIUM */}
      <div className="login-hero">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="bank"
        />
      </div>

      {/* 🔥 CARD */}
      <div className="card login-card">

        <div className="login-header">
          <span className="bank-icon">🏦</span>
          <h2>Connexion sécurisée</h2>
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form onSubmit={handleIdSubmit}>

            <input
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              placeholder="Identifiant personnel"
              required
            />

            <div className="login-actions">
              <a href="/forgot-id">Identifiant oublié ?</a>

              <button type="submit">
                Continuer →
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div>

            <p className="pin-label">
              Entrez votre code PIN
            </p>

            {/* 🔒 PIN DISPLAY */}
            <div className="pin-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {pin[i] ? "●" : "○"}
                </span>
              ))}
            </div>

            {/* 📱 CLAVIER */}
            <div className="pin-keyboard">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => addDigit(n)}>
                  {n}
                </button>
              ))}

              <button onClick={removeDigit}>←</button>
              <button onClick={() => addDigit(0)}>0</button>
              <button onClick={handleLogin}>✔</button>
            </div>

            <div className="login-actions">
              <a href="/forgot-pin">Code PIN oublié ?</a>
            </div>

          </div>
        )}

        {/* ❌ ERREUR */}
        {error && (
          <p className="error-msg">{error}</p>
        )}
      </div>
    </div>
  );
}