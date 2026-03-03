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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Étape suivante
  const nextStep = () => {
    setError(null);

    if (step === 1) {
      if (formData.password.length < 6) {
        return setError("Mot de passe trop court");
      }
      if (formData.password !== formData.confirmPassword) {
        return setError("Les mots de passe ne correspondent pas");
      }
    }

    if (step === 2) {
      if (!/^\d{5}$/.test(formData.pin)) {
        return setError("Le PIN doit contenir 5 chiffres");
      }
    }

    setStep(step + 1);
  };

  // Soumission finale
  const submit = async (e) => {
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
    <div className="phone-container">
      <form className="card" onSubmit={submit}>
        <h2>Activation du compte</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="button" onClick={nextStep}>
              Suivant
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              name="pin"
              placeholder="Code PIN (5 chiffres)"
              value={formData.pin}
              onChange={handleChange}
              maxLength={5}
              required
            />

            <button type="button" onClick={nextStep}>
              Suivant
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              name="confirmPin"
              placeholder="Confirmer le PIN"
              value={formData.confirmPin}
              onChange={handleChange}
              maxLength={5}
              required
            />

            <button type="submit">
              Activer le compte
            </button>
          </>
        )}

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}