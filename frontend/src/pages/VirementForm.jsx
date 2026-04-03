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

  // ✅ CORRECTION : Vérification robuste du bénéficiaire
  const handleAccountBlur = async (e) => {
  const val = e.target.value.trim(); // 👈 On prend la valeur directe de l'input
  
  if (val.length > 2) {
    try {
      const res = await api(`/transaction/check-recipient?accountNumber=${val}`);
      setForm(prev => ({ ...prev, iban: res.iban, bic: res.bic, accountNumber: val }));
      setError("");
    } catch (err) {
      setError("Destinataire introuvable dans le réseau BPER.");
      setForm(prev => ({ ...prev, iban: "", bic: "" }));
    }
  }
};

  const nextStep = () => {
    setError("");
    // ✅ Sécurité sur la lecture du solde (compatible avec les deux structures)
    const currentBalance = data.account ? data.account.balance : data.balance;

    if (!form.beneficiaryName || !form.accountNumber || !form.amount) {
      return setError("Veuillez remplir tous les champs obligatoires.");
    }
    if (parseFloat(form.amount) > currentBalance) {
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

  if (!data) return <div className="loading-screen">Chargement...</div>;

  // Préparation des variables d'affichage pour éviter les erreurs "undefined"
  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const accNum = data.account ? data.account.accountNumber : "Compte Courant";
  const displayBalance = data.account ? data.account.balance : data.balance;

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
                  <span className="user-fullname">{userNom} {userPrenom}</span>
                  <span className="account-tag">PRINCIPAL</span>
                </div>
                <p className="acc-num">{accNum}</p>
                <div className="account-details">
                  <span className="label-gray">Solde :</span>
                  <span className="amount-bold">{Number(displayBalance).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire</label>
              <input 
                type="text" 
                className="bper-input" 
                placeholder="Nom complet*" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />
              
              <input 
  type="text" 
  className="bper-input" 
  placeholder="Numéro de compte*" 
  value={form.accountNumber}
  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} 
  onBlur={handleAccountBlur} // 👈 On passe l'événement 'e'
/>
              <input 
                type="text" 
                className="bper-input read-only" 
                placeholder="IBAN (Auto)" 
                value={form.iban} 
                readOnly 
              />
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

        {/* ÉTAPE 2, 3 et 4 identiques à ton code original... */}
        {step === 2 && (
          <div className="recap-page">
            <h3>Détails du virement</h3>
            <div className="recap-card">
              <div className="recap-item"><label>De</label> <span>{userNom} {userPrenom}</span></div>
              <div className="recap-item"><label>À</label> <span>{form.beneficiaryName}</span></div>
              <div className="recap-item"><label>Montant</label> <span className="heavy">{form.amount} {form.currency}</span></div>
              <div className="recap-item"><label>Frais</label> <span>0,00 € (Gratuit)</span></div>
            </div>
            <button className="btn-continue" onClick={nextStep}>Confirmer</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {step === 3 && (
          <div className="pin-page">
            <Lock size={40} className="lock-icon" />
            <h3>Signature Digital</h3>
            <input type="password" maxLength="6" className="pin-input" placeholder="••••••" onChange={e => setPin(e.target.value)} autoFocus />
            {error && <p className="error-text" style={{color:'red'}}>{error}</p>}
            <button className="btn-continue" disabled={loading} onClick={confirmTransfer}>
              {loading ? "Traitement..." : "Valider"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="success-page">
            <div className="success-circle">✓</div>
            <h2>Opération réussie</h2>
            <button className="btn-continue" onClick={() => navigate("/dashboard")}>Terminer</button>
          </div>
        )}
      </div>
    </div>
  );
}