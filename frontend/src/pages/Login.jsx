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
  
  const [loading, setLoading] = useState(false); 

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

  setLoading(true); // 1. On lance le chargement
  setError("");     // On efface les erreurs précédentes

  try {
    const res = await api("/auth/login", "POST", { personalId, pin });
    
    // Si succès, on stocke et on redirige
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    if (res.user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/welcome", { state: { user: res.user } });
    }
    // Note : Pas besoin de remettre loading à false ici car on change de page
  } catch (err) {
    const message = err.message || "Erreur";
    
    setLoading(false); // 2. En cas d'erreur, on arrête le chargement pour montrer l'erreur
    
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

  if (loading) {
  return (
    <div className="bper-confirmation-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <svg 
          width="80" height="80" viewBox="0 0 24 24" fill="none" 
          stroke="#005a64" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="drawing-svg"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="draw-path shield-path" />
          <path d="m9 12 2 2 4-4" className="draw-path check-path" />
        </svg>
        <p style={{ marginTop: '20px', color: '#005a64', fontWeight: '800', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Vérification de votre compte...
        </p>
      </div>
      <style>{`
        .drawing-svg { filter: drop-shadow(0 4px 6px rgba(0, 90, 100, 0.1)); }
        .draw-path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 2.5s ease-in-out infinite; }
        .shield-path { animation-delay: 0s; }
        .check-path { stroke-dasharray: 20; stroke-dashoffset: 20; animation: draw-check 2.5s ease-in-out infinite; animation-delay: 0.5s; }
        @keyframes draw { 
          0% { stroke-dashoffset: 100; opacity: 0; } 
          20% { opacity: 1; } 
          50% { stroke-dashoffset: 0; } 
          80% { opacity: 1; } 
          100% { stroke-dashoffset: 0; opacity: 0; } 
        }
        @keyframes draw-check { 
          0% { stroke-dashoffset: 20; opacity: 0; } 
          30% { stroke-dashoffset: 20; opacity: 0; } 
          60% { stroke-dashoffset: 0; opacity: 1; } 
          80% { opacity: 1; } 
          100% { stroke-dashoffset: 0; opacity: 0; } 
        }
      `}</style>
    </div>
  );
}

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

            {/* Affichage de l'erreur avec style dynamique pour les tentatives */}
{error && (
  <p className={`form-error ${error.includes("Attention") ? "warning-mode" : ""}`}>
    {error.includes("Attention") && <span style={{marginRight: '5px'}}>⚠️</span>}
    {error}
  </p>
)}

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