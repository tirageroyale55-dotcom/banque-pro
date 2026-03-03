import { useState } from "react";
import { api } from "../services/api";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    setError(null);

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        return setError("Les mots de passe ne correspondent pas");
      }
      setStep(2);
    }

    if (step === 2) {
      if (!/^\d{5}$/.test(formData.pin)) {
        return setError("Le PIN doit contenir 5 chiffres");
      }
      setStep(3);
    }
  };

  const submit = async e => {
    e.preventDefault();
    setError(null);

    if (formData.pin !== formData.confirmPin) {
      return setError("Les PIN ne correspondent pas");
    }

    try {
      await api("/auth/activate", "POST", {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        pin: formData.pin
      });

      window.location = "/login";
    } catch (err) {
      setError(err.message || "Erreur activation");
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Activation du compte</h2>

      {/* ETAPE 1 : MOT DE PASSE */}
      {step === 1 && (
        <>
          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                cursor: "pointer"
              }}
            >
              👁️
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                cursor: "pointer"
              }}
            >
              👁️
            </span>
          </div>

          <button type="button" onClick={nextStep}>
            Suivant
          </button>
        </>
      )}

      {/* ETAPE 2 : PIN */}
      {step === 2 && (
        <>
          <input
            name="pin"
            placeholder="Code PIN (5 chiffres)"
            value={formData.pin}
            onChange={handleChange}
            required
          />

          <button type="button" onClick={nextStep}>
            Suivant
          </button>
        </>
      )}

      {/* ETAPE 3 : CONFIRMATION PIN */}
      {step === 3 && (
        <>
          <input
            name="confirmPin"
            placeholder="Confirmer Code PIN"
            value={formData.confirmPin}
            onChange={handleChange}
            required
          />

          <button type="submit">Activer</button>
        </>
      )}

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}
    </form>
  );
}