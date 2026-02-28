import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  /* ===== STEP 1 ===== */
  const handleId = e => {
    e.preventDefault();
    if (!personalId) return;
    setStep(2);
  };

  /* ===== PIN CLICK ===== */
  const handlePinClick = val => {
    if (pin.length >= 6) return;
    setPin(prev => prev + val);
  };

  const removePin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  /* ===== LOGIN ===== */
  const submitPin = async () => {
    if (pin.length < 4) return;

    try {
      const res = await api("/auth/login", "POST", {
        personalId,
        pin
      });

      localStorage.setItem("token", res.token);

      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError("Code PIN incorrect");

      setPin("");

      if (newAttempts >= 3) {
        setError("Compte temporairement bloqué");
      }
    }
  };

  return (
    <div className="apply-bg">

      <div className="apply-card login-card">

        {/* ===== STEP 1 IDENTIFIANT ===== */}
        {step === 1 && (
          <>
            <div className="login-illustration">
              <img src="/img/login-illu.png" alt="illustration" />
            </div>

            <h2 className="apply-title">Connexion</h2>

            <form onSubmit={handleId}>
              <input
                placeholder="Identifiant personnel"
                value={personalId}
                onChange={e => setPersonalId(e.target.value)}
                required
              />

              <button className="btn-solid">
                Continuer
              </button>
            </form>

            <p className="login-link">
              Identifiant oublié ?
            </p>
          </>
        )}

        {/* ===== STEP 2 PIN ===== */}
        {step === 2 && (
          <>
            <h2 className="apply-title">Saisissez votre code PIN</h2>

            {/* PIN DISPLAY */}
            <div className="pin-display">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={pin[i] ? "filled" : ""}></span>
              ))}
            </div>

            {/* ERROR */}
            {error && <p className="form-error">{error}</p>}

            {/* CLAVIER */}
            <div className="pin-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handlePinClick(n)}>
                  {n}
                </button>
              ))}

              <button onClick={removePin}>⌫</button>
              <button onClick={() => handlePinClick(0)}>0</button>
              <button onClick={submitPin}>✔</button>
            </div>

            {/* RESET */}
            {attempts >= 3 && (
              <div className="login-help">
                <p>Code PIN oublié ?</p>
                <button className="btn-outline">
                  Réinitialiser le PIN
                </button>

                <button className="btn-outline">
                  Réinitialiser le mot de passe
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}