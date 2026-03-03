import { useState } from "react";
import { api } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [error, setError] = useState("");

  // ===== PIN HANDLER =====
  const handlePinClick = (val, type = "pin") => {
    if (type === "pin") {
      if (pin.length >= 5) return;
      setPin(prev => prev + val);
    } else {
      if (confirmPin.length >= 5) return;
      setConfirmPin(prev => prev + val);
    }
  };

  const removePin = (type = "pin") => {
    if (type === "pin") {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  // ===== STEP 1 =====
  const handlePassword = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    setStep(2);
  };

  // ===== STEP 2 =====
  const handlePinNext = () => {
    if (pin.length !== 5) {
      setError("Le PIN doit contenir 5 chiffres");
      return;
    }

    setError("");
    setStep(3);
  };

  // ===== STEP 3 =====
  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setError("Les PIN ne correspondent pas");
      return;
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

        {/* ===== STEP 1 : PASSWORD ===== */}
{step === 1 && (
  <>
    <h2 className="apply-title">Créer votre mot de passe</h2>

    <form onSubmit={handlePassword}>
      {/* PASSWORD */}
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ paddingRight: 40 }}
        />

        <span
          onClick={() => setShowPassword(!showPassword)}
          style={iconStyle}
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </span>
      </div>

      {/* CONFIRM PASSWORD */}
      <div style={{ position: "relative" }}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmer mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ paddingRight: 40 }}
        />

        <span
          onClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          style={iconStyle}
        >
          {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="btn-right">
        <button className="btn-solid">Continuer</button>
      </div>
    </form>
  </>
)}

        {/* ===== STEP 2 : CREATE PIN ===== */}
        {step === 2 && (
          <>
            <h2 className="apply-title">Choisissez votre code PIN</h2>

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

              <button onClick={() => removePin()}>⌫</button>
              <button onClick={() => handlePinClick(0)}>0</button>
              <button onClick={handlePinNext}>✔</button>
            </div>
          </>
        )}

        {/* ===== STEP 3 : CONFIRM PIN ===== */}
        {step === 3 && (
          <>
            <h2 className="apply-title">Confirmez votre code PIN</h2>

            <div className="pin-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={confirmPin[i] ? "filled" : ""}></span>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="pin-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handlePinClick(n, "confirm")}>
                  {n}
                </button>
              ))}

              <button onClick={() => removePin("confirm")}>⌫</button>
              <button onClick={() => handlePinClick(0, "confirm")}>0</button>
              <button onClick={handleSubmit}>✔</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

const iconStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  width: 20,
  height: 20,
  cursor: "pointer",
  color: "#888"
};