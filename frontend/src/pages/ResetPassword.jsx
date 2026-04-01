import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1
  const [personalId, setPersonalId] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Step 2
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // PIN
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // ===== STEP 1 =====
  const handleCheckId = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await api("/auth/check-id", "POST", { personalId });

    if (!res.exists) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError("Identifiant non trouvé");
      if (newAttempts >= 3) return navigate("/");
      return;
    }

    // 🔥 LA CORRECTION EST ICI :
    // Si le compte est BLOCKED, on ne bloque l'utilisateur QUE S'IL N'A PAS DE TOKEN
    if (res.status === "BLOCKED" && !token) {
      setError("Votre compte est bloqué. Veuillez utiliser le lien de réinitialisation envoyé par l'administrateur.");
      return;
    }

    setStep(2); // Si on a un token ou si le compte n'est pas bloqué, on passe à la suite
  } catch {
    setError("Erreur serveur");
  }
};
  // ===== STEP 2 =====
  const handlePasswordNext = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    setStep(3);
  };

  // ===== PIN INPUT =====
  const handlePinClick = (val, type = "pin") => {
    if (type === "pin") {
      if (pin.length >= 5) return;
      setPin((prev) => prev + val);
    } else {
      if (confirmPin.length >= 5) return;
      setConfirmPin((prev) => prev + val);
    }
  };

  const removePin = (type = "pin") => {
    if (type === "pin") setPin((prev) => prev.slice(0, -1));
    else setConfirmPin((prev) => prev.slice(0, -1));
  };

  // 👉 STEP 3 → passer à confirmation automatiquement
  useEffect(() => {
    if (step === 3 && pin.length === 5) {
      setStep(4);
    }
  }, [pin, step]);

  // 👉 STEP 4 → validation automatique finale
  useEffect(() => {
  if (step === 4 && pin.length === 5 && confirmPin.length === 5) {

    if (pin !== confirmPin) {
      setError("Les PIN ne correspondent pas");
      return;
    }

    handleSubmit();
  }
}, [pin, confirmPin, step]);

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    try {
      const cleanPin = String(pin).trim();

      await api("/auth/reset-password", "POST", {
       token,
       personalId,
       password,
       confirmPassword,
       pin: cleanPin,
      });

      alert("Mot de passe et PIN mis à jour avec succès !");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Erreur serveur");
    }
  };

  return (
    <div className="apply-bg login-page">
      <div className="apply-card login-card">
        <div className="bank-icon">🏦</div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="apply-title">Récupération de compte</h2>
            <form onSubmit={handleCheckId}>
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
          </>
        )}

        {/* STEP 2 (INCHANGÉ) */}
        {step === 2 && (
          <>
            <h2 className="apply-title">Nouveau mot de passe</h2>
            <form onSubmit={handlePasswordNext}>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <span onClick={() => setShowPassword(!showPassword)} style={iconStyle}>
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </span>
              </div>

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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

        {/* STEP 3 : PIN */}
        {step === 3 && (
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
                <button key={n} type="button" onClick={() => handlePinClick(n, "pin")}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => removePin("pin")}>⌫</button>
              <button type="button" onClick={() => handlePinClick(0, "pin")}>0</button>
            </div>
          </>
        )}

        {/* STEP 4 : CONFIRM PIN */}
        {step === 4 && (
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
                <button key={n} type="button" onClick={() => handlePinClick(n, "confirm")}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => removePin("confirm")}>⌫</button>
              <button type="button" onClick={() => handlePinClick(0, "confirm")}>0</button>
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