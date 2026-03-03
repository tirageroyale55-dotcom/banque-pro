import { useState } from "react";
import { api } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: ""
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = e => {
    e.preventDefault();
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
    <form className="card" onSubmit={step === 3 ? submit : nextStep}>
      <h2>Activation du compte</h2>

      {/* STEP 1 */}
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
              style={{ paddingRight: 35 }}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={iconStyle}>
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
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
              style={{ paddingRight: 35 }}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={iconStyle}
            >
              {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </span>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <input
          name="pin"
          placeholder="Code PIN (5 chiffres)"
          value={formData.pin}
          onChange={handleChange}
          maxLength={5}
          required
        />
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <input
          name="confirmPin"
          placeholder="Confirmer Code PIN"
          value={formData.confirmPin}
          onChange={handleChange}
          maxLength={5}
          required
        />
      )}

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}

      <button>
        {step === 3 ? "Activer" : "Suivant"}
      </button>
    </form>
  );
}

const iconStyle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  width: 18,
  height: 18,
  cursor: "pointer",
  color: "#777"
};