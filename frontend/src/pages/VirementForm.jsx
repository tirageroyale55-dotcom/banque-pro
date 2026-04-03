import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, HelpCircle, AlertCircle, Lock } from "lucide-react";
import "../styles/virement.css";

export default function VirementForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null); // Contient user + account
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");

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
    // On récupère les infos globales du client
    api("/client/dashboard")
      .then((res) => {
        setData(res);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleAccountBlur = async () => {
    if (form.accountNumber.length > 5) {
      try {
        const res = await api(`/transaction/check-recipient?accountNumber=${form.accountNumber}`);
        setForm({ ...form, iban: res.iban, bic: res.bic });
        setError("");
      } catch (err) {
        setError("Numéro de compte incorrect ou introuvable");
        setForm({ ...form, iban: "", bic: "" });
      }
    }
  };

  const nextStep = () => {
    if (parseFloat(form.amount) > data.account.balance) {
      setError("Solde insuffisant");
      return;
    }
    if (!form.iban || !form.amount || !form.beneficiaryName) {
      setError("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const confirmTransfer = async () => {
    try {
      setError("");
      await api("/transaction/transfer", "POST", { 
        recipientIdentifier: form.iban, 
        amount: form.amount, 
        label: form.motif,
        pin: pin 
      });
      setStep(4); 
    } catch (err) {
      setError(err.message || "Code PIN incorrect ou erreur système");
    }
  };

  if (!data) return <div className="loading">Chargement sécurisé...</div>;

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            {step === 4 ? "Fermer" : "Annuler"}
          </button>
          <span className="header-title">Virement Bancaire</span>
          <HelpCircle size={20} className="help-icon" />
        </div>
        <div className="progress-container">
          <div className={`progress-bar step-${step}`}></div>
          <span className="step-text">{step > 3 ? "Terminé" : `${step} sur 3`}</span>
        </div>
      </header>

      <div className="virement-content">
        
        {step === 1 && (
          <>
            <div className="security-box">
              <CheckCircle size={20} color="#005a64" />
              <p>Opération sécurisée. Vérifiez bien les coordonnées du bénéficiaire avant de confirmer.</p>
            </div>

            <div className="form-section">
              <label className="section-title">Au nom de (Expéditeur)</label>
              <div className="account-selector-box highlight">
                <div className="user-info-row">
                  <span className="user-fullname">{data.user.nom} {data.user.prenom}</span>
                  <span className="account-tag">COMPTE COURANT</span>
                </div>
                <p className="acc-num">{data.account.accountNumber}</p>
                <div className="account-details">
                  <span className="label-gray">Solde disponible :</span>
                  <span className="amount-bold">{data.account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire</label>
              <input type="text" className="bper-input" placeholder="Nom et prénom du bénéficiaire*" value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input" placeholder="N° de compte du destinataire" onBlur={handleAccountBlur} onChange={e => setForm({...form, accountNumber: e.target.value})} />
              <input type="text" className="bper-input read-only" placeholder="IBAN (Auto-rempli)" value={form.iban} readOnly />
              <input type="text" className="bper-input read-only" placeholder="BIC (Auto-rempli)" value={form.bic} readOnly />
            </div>

            <div className="form-section">
              <label className="section-title">Détails du virement</label>
              <div className="dual-input">
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input type="number" className="bper-input" placeholder="0,00" onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <input type="text" className="bper-input" placeholder="Motif du virement" onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={nextStep}>Continuer vers le récapitulatif</button>
          </>
        )}

        {step === 2 && (
          <div className="recap-page">
            <h3>Vérifiez votre virement</h3>
            <div className="recap-card">
              <div className="recap-item"><label>De</label> <span>{data.user.nom} {data.user.prenom}</span></div>
              <div className="recap-item"><label>Vers</label> <span>{form.beneficiaryName}</span></div>
              <div className="recap-item"><label>IBAN</label> <span className="small-text">{form.iban}</span></div>
              <div className="recap-item"><label>Montant</label> <span className="heavy">{form.amount} {form.currency}</span></div>
              <div className="recap-item"><label>Type</label> <span>Virement instantané</span></div>
            </div>
            <div className="nb-box">NB : Les fonds seront transférés immédiatement après la signature.</div>
            <button className="btn-continue" onClick={nextStep}>Signer le virement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier les infos</button>
          </div>
        )}

        {step === 3 && (
          <div className="pin-page">
            <Lock size={40} className="lock-icon" color="#005a64" />
            <h3>Signature numérique</h3>
            <p>Saisissez votre code PIN secret pour confirmer le virement de <b>{form.amount} {form.currency}</b>.</p>
            <input 
              type="password" 
              maxLength="6" 
              className="pin-input" 
              placeholder="••••••" 
              autoFocus
              onChange={e => setPin(e.target.value)} 
            />
            {error && <div className="error-msg" style={{marginTop: '10px'}}>{error}</div>}
            <button className="btn-continue" onClick={confirmTransfer}>Confirmer l'envoi</button>
          </div>
        )}

        {step === 4 && (
          <div className="success-page">
            <div className="success-icon-wrapper">
              <CheckCircle size={80} color="#fff" fill="#005a64" />
            </div>
            <h2>Virement effectué !</h2>
            <p>La somme de <b>{form.amount} {form.currency}</b> a été envoyée avec succès à {form.beneficiaryName}.</p>
            <button className="btn-continue" onClick={() => navigate("/dashboard")}>Retour au tableau de bord</button>
          </div>
        )}
      </div>
    </div>
  );
}