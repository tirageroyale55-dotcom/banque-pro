import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, HelpCircle, AlertCircle, Lock } from "lucide-react";
import "../styles/virement.css";

export default function VirementForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null); 
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    beneficiaryName: "",
    accountNumber: "",
    iban: "",
    bic: "",
    amount: "",
    currency: "EUR",
    motif: ""
  });

  useEffect(() => {
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Remplissage automatique IBAN/BIC
  const handleAccountBlur = async () => {
    if (form.accountNumber.trim().length > 5) {
      try {
        const res = await api(`/transaction/check-recipient?accountNumber=${form.accountNumber}`);
        setForm(prev => ({ ...prev, iban: res.iban, bic: res.bic }));
        setError("");
      } catch (err) {
        setError("Destinataire introuvable ou numéro incorrect.");
        setForm(prev => ({ ...prev, iban: "", bic: "" }));
      }
    }
  };

  const nextStep = () => {
    setError("");
    if (!form.beneficiaryName || !form.accountNumber || !form.amount) {
      return setError("Veuillez remplir tous les champs obligatoires.");
    }
    if (parseFloat(form.amount) > data.account.balance) {
      return setError("Solde insuffisant pour effectuer ce virement.");
    }
    setStep(step + 1);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    try {
      await api("/transaction/transfer", "POST", { 
        recipientIdentifier: form.iban, 
        amount: form.amount, 
        label: form.motif,
        pin: pin 
      });
      setStep(4); 
    } catch (err) {
      setError(err.message || "Code PIN incorrect.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="loading-screen">Chargement des données sécurisées...</div>;

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            {step === 4 ? "Fermer" : "Annuler"}
          </button>
          <span className="header-title">Virement</span>
          <HelpCircle size={20} />
        </div>
        <div className="progress-container">
          <div className={`progress-bar step-${step}`}></div>
          <span className="step-text">Étape {step > 3 ? "3" : step}/3</span>
        </div>
      </header>

      <div className="virement-content">
        {/* ÉTAPE 1 : SAISIE */}
        {step === 1 && (
          <>
            <div className="security-box">
              <CheckCircle size={18} />
              <p>Transfert sécurisé vers le réseau SEPA.</p>
            </div>

            <div className="form-section">
              <label className="section-title">Au nom de</label>
              <div className="account-selector-box highlight">
                <div className="user-info-row">
                  <span className="user-fullname">{data.user.nom} {data.user.prenom}</span>
                  <span className="account-tag">COMPTE COURANT</span>
                </div>
                <p className="acc-num">{data.account.accountNumber}</p>
                <div className="account-details">
                  <span className="label-gray">Solde :</span>
                  <span className="amount-bold">{data.account.balance.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire</label>
              <input type="text" className="bper-input" placeholder="Nom complet*" value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input" placeholder="Numéro de compte*" onBlur={handleAccountBlur} value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} />
              <input type="text" className="bper-input read-only" placeholder="IBAN (Auto)" value={form.iban} readOnly />
            </div>

            <div className="form-section">
              <label className="section-title">Montant</label>
              <div className="dual-input">
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input type="number" className="bper-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
            </div>

            {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={nextStep}>Continuer</button>
          </>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF */}
        {step === 2 && (
          <div className="recap-page">
            <h3>Détails du virement</h3>
            <div className="recap-card">
              <div className="recap-item"><label>De</label> <span>{data.user.nom} {data.user.prenom}</span></div>
              <div className="recap-item"><label>À</label> <span>{form.beneficiaryName}</span></div>
              <div className="recap-item"><label>Montant</label> <span className="heavy">{form.amount} {form.currency}</span></div>
              <div className="recap-item"><label>Frais</label> <span>0,00 € (Gratuit)</span></div>
            </div>
            <p className="nb-notice">Le virement sera traité instantanément.</p>
            <button className="btn-continue" onClick={nextStep}>Confirmer les données</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : PIN */}
        {step === 3 && (
          <div className="pin-page">
            <Lock size={40} className="lock-icon" />
            <h3>Signature Digital</h3>
            <p>Saisissez votre code PIN pour valider.</p>
            <input type="password" maxLength="6" className="pin-input" placeholder="••••••" onChange={e => setPin(e.target.value)} autoFocus />
            {error && <p className="error-text" style={{color:'red', textAlign:'center'}}>{error}</p>}
            <button className="btn-continue" disabled={loading} onClick={confirmTransfer}>
              {loading ? "Traitement..." : "Valider le virement"}
            </button>
          </div>
        )}

        {/* ÉTAPE 4 : SUCCÈS */}
        {step === 4 && (
          <div className="success-page">
            <div className="success-circle">✓</div>
            <h2>Opération réussie</h2>
            <p>Votre virement de {form.amount} {form.currency} a été envoyé.</p>
            <button className="btn-continue" onClick={() => navigate("/dashboard")}>Terminer</button>
          </div>
        )}
      </div>
    </div>
  );
}