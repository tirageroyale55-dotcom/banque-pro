import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Globe, CheckCircle, HelpCircle, AlertCircle, Lock, 
  Loader2, FileText, Home, XCircle, Info 
} from "lucide-react";
import "../styles/virement.css";

export default function VirementInternational() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [txRef] = useState(`SWIFT-${Math.random().toString(36).toUpperCase().substr(2, 9)}`);

  const [form, setForm] = useState({
    beneficiaryName: "",
    iban: "",
    bic: "",
    bankName: "",
    country: "",
    amount: "",
    currency: "EUR",
    motif: ""
  });

  useEffect(() => {
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Validation automatique du PIN à 5 chiffres
  useEffect(() => {
    if (pin.length === 5 && step === 3) {
      processInternationalTransfer();
    }
  }, [pin]);

  const processInternationalTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      // ✅ Appel API pour le virement international
      await api("/transaction/transfer-international", "POST", {
        iban: form.iban,
        amount: form.amount,
        pin: pin,
        label: form.motif
      });

      setTimeout(() => {
        setLoading(false);
        setStep(4);
      }, 2500);

    } catch (err) {
      setLoading(false);
      setPin("");
      // ✅ Message spécifique si l'IBAN n'est pas autorisé / en base
      if (err.message.includes("not found") || err.message.includes("base")) {
        setError("Virement non effectué : Les coordonnées bancaires (IBAN) saisies ne sont pas enregistrées dans notre base de données sécurisée. Veuillez contacter votre conseiller ou l'administrateur BPER pour habiliter ce bénéficiaire.");
      } else {
        setError(err.message || "Échec de l'authentification de la transaction.");
      }
    }
  };

  if (!data) return <div className="loading-screen">Vérification des protocoles SWIFT...</div>;

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            {step === 4 ? "Fermer" : "Annuler"}
          </button>
          <span className="header-title">Virement International</span>
          <Globe size={20} className="text-blue" />
        </div>
      </header>

      <div className="virement-content">
        
        {/* ÉTAPE 1 : SAISIE DES COORDONNÉES INTERNATIONALES */}
        {step === 1 && (
          <div className="fade-in">
            <div className="info-box-blue">
              <Info size={18} />
              <p>Les virements hors zone SEPA sont soumis aux contrôles de la réglementation bancaire internationale.</p>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire Externe</label>
              <input type="text" className="bper-input" placeholder="Nom complet du bénéficiaire" value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input mono" placeholder="IBAN International" value={form.iban} onChange={e => setForm({...form, iban: e.target.value.toUpperCase()})} />
              <input type="text" className="bper-input" placeholder="Code BIC / SWIFT" value={form.bic} onChange={e => setForm({...form, bic: e.target.value.toUpperCase()})} />
              <input type="text" className="bper-input" placeholder="Banque de destination" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
            </div>

            <div className="form-section">
              <label className="section-title">Montant et Devise</label>
              <div className="dual-input">
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input type="number" className="bper-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
            </div>

            <button className="btn-continue" onClick={() => setStep(2)}>Vérifier l'éligibilité</button>
          </div>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF AVANT SIGNATURE */}
        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Récapitulatif de l'ordre de transfert</h3>
            <div className="recap-container">
              <div className="recap-group">
                <span className="group-label">BÉNÉFICIAIRE</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Nom :</label> <span>{form.beneficiaryName}</span></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>BIC :</label> <span>{form.bic}</span></div>
                </div>
              </div>
              <div className="recap-group">
                <span className="group-label">FINANCES</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                  <div className="info-row"><label>Frais de change :</label> <span>Inclus</span></div>
                </div>
              </div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Signer numériquement</button>
          </div>
        )}

        {/* ÉTAPE 3 : CLAVIER PIN (Comme le précédent) */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Analyse de conformité du bénéficiaire...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}>
                   <Lock size={40} className={error ? "text-red" : "text-blue"} />
                </div>
                <h3>Confirmation BPER Secure</h3>
                <p>Entrez votre code PIN pour valider l'envoi</p>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""} ${error ? "dot-error" : ""}`}></div>
                  ))}
                </div>
                {/* Ton composant Numpad ici... */}
                <div className="numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>
                    ))}
                    <button className="btn-empty"></button>
                    <button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button>
                    <button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}>X</button>
                </div>

                {error && (
                  <div className="error-alert-virement">
                    <XCircle size={20} />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : RÉSULTAT */}
        {step === 4 && (
          <div className="success-page">
             <CheckCircle size={80} color="#10b981" />
             <h2>Virement International Transmis</h2>
             <p>Référence SWIFT : {txRef}</p>
             <button className="btn-home" onClick={() => navigate("/dashboard")}>Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}