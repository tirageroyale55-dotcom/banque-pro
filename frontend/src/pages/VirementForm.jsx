import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, HelpCircle, AlertCircle, Lock } from "lucide-react";
import "../styles/virement.css";

export default function VirementForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
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
    api("/client/dashboard").then(setUserData).catch(() => navigate("/login"));
  }, []);

  // Recherche automatique du bénéficiaire
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
    if (parseFloat(form.amount) > userData.balance) {
      setError("Solde insuffisant");
      return;
    }
    if (!form.iban || !form.amount) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const confirmTransfer = async () => {
    try {
      await api("/transaction/transfer", "POST", { 
        recipientIdentifier: form.iban, 
        amount: form.amount, 
        label: form.motif,
        pin: pin // Ton backend devra vérifier le PIN
      });
      setStep(4); // Succès
    } catch (err) {
      setError("Code PIN incorrect ou erreur de transaction");
    }
  };

  if (!userData) return null;

  return (
    <div className="virement-wrapper">
      {/* HEADER PROGRESSIF */}
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
        
        {/* ÉTAPE 1 : SAISIE */}
        {step === 1 && (
          <>
            <div className="security-box">
              <CheckCircle size={20} />
              <p>Remplissez les informations selon les normes de sécurité <b>BPER</b>.</p>
            </div>

            <div className="form-section">
              <label className="section-title">Au nom de</label>
              <div className="account-selector-box highlight">
                <span className="account-name">COMPTE DE DÉPÔT</span>
                <p className="acc-num">{userData.accountNumber}</p>
                <div className="account-details">
                  <span className="label-gray">Solde disponible :</span>
                  <span className="amount-bold">{userData.balance.toLocaleString()} €</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire</label>
              <input type="text" className="bper-input" placeholder="Nom et prénom*" value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input" placeholder="Numéro de compte" onBlur={handleAccountBlur} onChange={e => setForm({...form, accountNumber: e.target.value})} />
              <input type="text" className="bper-input read-only" placeholder="IBAN" value={form.iban} readOnly />
              <input type="text" className="bper-input read-only" placeholder="Code BIC (SWIFT)" value={form.bic} readOnly />
            </div>

            <div className="form-section">
              <label className="section-title">Détails du virement</label>
              <div className="dual-input">
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input type="number" className="bper-input" placeholder="Montant" onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <input type="text" className="bper-input" placeholder="Motif (Optionnel)" onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={nextStep}>Continuer</button>
          </>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF */}
        {step === 2 && (
          <div className="recap-page">
            <h3>Vérifiez les informations</h3>
            <div className="recap-card">
              <div className="recap-item"><label>Bénéficiaire</label> <span>{form.beneficiaryName}</span></div>
              <div className="recap-item"><label>IBAN</label> <span>{form.iban}</span></div>
              <div className="recap-item"><label>Montant</label> <span className="heavy">{form.amount} {form.currency}</span></div>
              <div className="recap-item"><label>Date</label> <span>Instantané</span></div>
            </div>
            <div className="nb-box">NB: Ce virement est instantané et irrévocable.</div>
            <button className="btn-continue" onClick={nextStep}>Confirmer et continuer</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : CODE PIN */}
        {step === 3 && (
          <div className="pin-page">
            <Lock size={40} className="lock-icon" />
            <h3>Confirmation sécurisée</h3>
            <p>Veuillez saisir votre code PIN à 6 chiffres pour valider l'envoi de <b>{form.amount} €</b>.</p>
            <input type="password" maxLength="6" className="pin-input" placeholder="••••••" onChange={e => setPin(e.target.value)} />
            {error && <p className="error-text">{error}</p>}
            <button className="btn-continue" onClick={confirmTransfer}>Valider le virement</button>
          </div>
        )}

        {/* ÉTAPE FINALE : SUCCÈS */}
        {step === 4 && (
          <div className="success-page">
            <div className="success-icon">✓</div>
            <h2>Virement effectué avec succès</h2>
            <p>Le compte de {form.beneficiaryName} sera crédité instantanément.</p>
            <button className="btn-continue" onClick={() => navigate("/dashboard")}>Retour à l'accueil</button>
          </div>
        )}

      </div>
    </div>
  );
}