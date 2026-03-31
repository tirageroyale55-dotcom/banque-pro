import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [personalId, setPersonalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleForgotId = () => {
    navigate("/forgot-id");
  };

  // ===== STEP 1 =====
  const handleId = async (e) => {
    e.preventDefault();

    const cleanId = personalId.trim();
    if (!cleanId) return;

    try {
      const res = await api("/auth/check-id", "POST", { personalId: cleanId });

      if (!res.exists) {
        setError("Identifiant incorrect");
        return;
      }

      setError("");
      setStep(2);

    } catch (err) {
      console.error(err);
      setError("Erreur serveur");
    }
  };

  // ===== PIN HANDLER =====
  const handlePinClick = (val) => {
    if (pin.length >= 5) return;
    setPin((prev) => prev + val);
  };

  const removePin = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // ===== LOGIN PIN SUBMIT =====
  const submitPin = async () => {
    if (pin.length !== 5) return;

    try {
      const res = await api("/auth/login", "POST", { personalId, pin });
      
      console.log("LOGIN RESPONSE:", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/welcome", { state: { user: res.user } });
      }

    } catch (err) {

  const message = err.message || "Erreur";

  // 🚨 SI BLOQUÉ → REDIRECTION
  if (err.status === 403 && message.includes("bloqué")) {
    navigate("/blocked");
    return;
  }

  setError(message);
  setPin("");
}
  };

  // ===== AUTOMATIQUE : dès 5 chiffres, submit =====
  useEffect(() => {
    if (step === 2 && pin.length === 5) {
      submitPin();
    }
  }, [pin, step]); // déclenche submit automatiquement

  return (
    <div className="apply-bg login-page">
      <div className="login-top-illustration">
        <img src="/img/login-illu.png" alt="illustration" />
      </div>

      <div className="apply-card login-card">

        <div className="bank-icon">🏦</div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="apply-title">Connexion</h2>

            <form onSubmit={handleId}>
              <input
                placeholder="Identifiant personnel"
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value)}
                required
              />

              {error && <p className="form-error">{error}</p>}

              <div className="btn-right">
                <button className="btn-solid">Continuer</button>
              </div>
            </form>

            {error && (
              <p className="login-link" onClick={handleForgotId}>
                Identifiant oublié ?
              </p>
            )}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="apply-title">Saisissez votre code PIN</h2>

            <div className="pin-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={pin[i] ? "filled" : ""}></span>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            {error && (
              <p className="login-link" onClick={() => navigate("/forgot-pin")}>
                Code PIN oublié ?
              </p>
            )}

            <div className="pin-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} type="button" onClick={() => handlePinClick(n)}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={removePin}>⌫</button>
              <button type="button" onClick={() => handlePinClick(0)}>0</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}