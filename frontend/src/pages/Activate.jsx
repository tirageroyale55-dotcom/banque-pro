import { useState } from "react";
import { api } from "../services/api";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  /* ===== PIN PAD ===== */
  const handlePinClick = (val) => {
    if (step === 1 && pin.length < 5) {
      setPin((prev) => prev + val);
    }
    if (step === 3 && confirmPin.length < 5) {
      setConfirmPin((prev) => prev + val);
    }
  };

  const removePin = () => {
    if (step === 1) setPin((prev) => prev.slice(0, -1));
    if (step === 3) setConfirmPin((prev) => prev.slice(0, -1));
  };

  /* ===== STEP VALIDATION ===== */
  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (pin.length !== 5) {
        return setError("Le PIN doit contenir 5 chiffres");
      }
      setStep(2);
    }

    else if (step === 2) {
      if (!password || password.length < 6) {
        return setError("Mot de passe trop court");
      }
      if (password !== confirmPassword) {
        return setError("Les mots de passe ne correspondent pas");
      }
      setStep(3);
    }
  };

  /* ===== FINAL SUBMIT ===== */
  const submit = async () => {
    setError("");

    if (confirmPin !== pin) {
      return setError("Les codes PIN ne correspondent pas");
    }

    try {
      await api("/auth/activate", "POST", {
        token,
        password,
        confirmPassword,
        pin
      });

      alert("Compte activé avec succès !");
      window.location = "/login";

    } catch (err) {
      setError(err.message || "Erreur activation");
    }
  };

  return (
    <div className="apply-bg login-page">

      <div className="apply-card login-card">

        <div className="bank-icon">🔐</div>

        {/* ================= STEP 1 PIN ================= */}
        {step === 1 && (
          <>
            <h2 className="apply-title">Créer votre code PIN</h2>

            <div className="pin-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={pin[i] ? "filled" : ""}></span>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="pin-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handlePinClick(n)}>
                  {n}
                </button>
              ))}

              <button onClick={removePin}>⌫</button>
              <button onClick={() => handlePinClick(0)}>0</button>
              <button onClick={nextStep}>✔</button>
            </div>
          </>
        )}

        {/* ================= STEP 2 PASSWORD ================= */}
        {step === 2 && (
          <>
            <h2 className="apply-title">Créer votre mot de passe</h2>

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="btn-right">
              <button className="btn-solid" onClick={nextStep}>
                Continuer
              </button>
            </div>
          </>
        )}

        {/* ================= STEP 3 CONFIRM PIN ================= */}
        {step === 3 && (
          <>
            <h2 className="apply-title">Confirmer votre code PIN</h2>

            <div className="pin-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={confirmPin[i] ? "filled" : ""}></span>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="pin-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handlePinClick(n)}>
                  {n}
                </button>
              ))}

              <button onClick={removePin}>⌫</button>
              <button onClick={() => handlePinClick(0)}>0</button>
              <button onClick={submit}>✔</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}