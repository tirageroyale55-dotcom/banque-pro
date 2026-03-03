import { useState } from "react";
import { api } from "../services/api";

export default function Activate() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 👉 Étape suivante
  const nextStep = () => {
    setError(null);

    if (step === 1) {
      if (form.password !== form.confirmPassword) {
        return setError("Les mots de passe ne correspondent pas");
      }
      if (form.password.length < 6) {
        return setError("Mot de passe trop court");
      }
    }

    if (step === 2) {
      if (!/^\d{5}$/.test(form.pin)) {
        return setError("Le PIN doit contenir 5 chiffres");
      }
    }

    setStep(step + 1);
  };

  // 👉 Soumission finale
  const submit = async () => {
    setError(null);

    if (form.pin !== form.confirmPin) {
      return setError("Les PIN ne correspondent pas");
    }

    try {
      await api("/auth/activate", "POST", {
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
        pin: form.pin
      });

      window.location = "/login";
    } catch (err) {
      setError(err.message || "Erreur activation");
    }
  };

  return (
    <div className="card">
      <h2>Activation du compte</h2>

      {/* ✅ ÉTAPE 1 */}
      {step === 1 && (
        <>
          <p>Étape 1 : Créer votre mot de passe</p>

          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmer mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button onClick={nextStep}>Suivant</button>
        </>
      )}

      {/* ✅ ÉTAPE 2 */}
      {step === 2 && (
        <>
          <p>Étape 2 : Choisir votre code PIN</p>

          <input
            name="pin"
            type="password"
            maxLength="5"
            placeholder="Code PIN (5 chiffres)"
            value={form.pin}
            onChange={handleChange}
            required
          />

          <button onClick={nextStep}>Suivant</button>
        </>
      )}

      {/* ✅ ÉTAPE 3 */}
      {step === 3 && (
        <>
          <p>Étape 3 : Confirmer votre code PIN</p>

          <input
            name="confirmPin"
            type="password"
            maxLength="5"
            placeholder="Confirmer PIN"
            value={form.confirmPin}
            onChange={handleChange}
            required
          />

          <button onClick={submit}>Activer</button>
        </>
      )}

      {/* ❌ ERREUR */}
      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}