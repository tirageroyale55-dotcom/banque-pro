import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { extractIBAN, isValidIBAN } from "ibantools"; 
import { 
  Globe, CheckCircle, Lock, Loader2, XCircle, Info, Zap, 
  Calendar, AlertTriangle, ArrowRight, Home
} from "lucide-react";
import "../styles/virement.css";

export default function VirementInternational() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [txRef] = useState(`SWIFT-${Math.random().toString(36).toUpperCase().substr(2, 9)}`);
  
  const [isInstant, setIsInstant] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [executionDate, setExecutionDate] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const [form, setForm] = useState({
    beneficiaryName: "",
    iban: "",
    bic: "",
    bankName: "",
    amount: "",
    currency: "EUR",
    motif: ""
  });

  // Calcul automatique de la date de valeur (J+2)
  useEffect(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    setExecutionDate(minDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // AUTO-REMPLISSAGE DES CHAMPS VIA L'IBAN
  const handleIbanAnalysis = (value) => {
    const cleanIban = value.toUpperCase().replace(/\s/g, '');
    let updatedForm = { ...form, iban: cleanIban };

    if (isValidIBAN(cleanIban)) {
      const ibanData = extractIBAN(cleanIban);
      const countryCode = cleanIban.substring(0, 2);
      
      // Extraction du code banque (Bank Code)
      const bankCode = ibanData.bank_code || "SWFT";

      // Remplissage automatique des champs "bloqués"
      updatedForm.bic = `${bankCode}${countryCode}BBXXX`.substring(0, 8);
      updatedForm.bankName = `BANQUE CORRESPONDANTE (${countryCode} - ID:${bankCode})`;

      // Logique d'activation Instantanée (Italie = Zone BPER Interne)
      if (countryCode === "IT") {
        setIsInternal(true);
      } else {
        setIsInternal(false);
        setIsInstant(false);
      }
      setError("");
    } else {
      // Réinitialisation si l'IBAN devient invalide pendant la saisie
      updatedForm.bic = "";
      updatedForm.bankName = "";
      setIsInternal(false);
    }
    setForm(updatedForm);
  };

  const validateStep1 = () => {
    setAttemptedNext(true);
    const { beneficiaryName, iban, bic, bankName, amount, motif } = form;
    
    if (!beneficiaryName || !iban || !bic || !bankName || !amount || !motif || !isValidIBAN(iban)) {
      setError("Action requise : Veuillez compléter tous les champs obligatoires en rouge.");
      return false;
    }
    setError("");
    setStep(2);
  };

  const processTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      await api("/transaction/transfer-international", "POST", { ...form, pin, executionDate, isInstant });
      setTimeout(() => { setLoading(false); setStep(4); }, 2500);
    } catch (err) {
      setLoading(false);
      setPin("");
      setError(err.message.includes("base") ? "Transfert bloqué : IBAN non certifié par BPER." : err.message);
    }
  };

  if (!data) return <div className="loading-screen">Initialisation des protocoles...</div>;

  // Détection des erreurs pour l'affichage rouge
  const checkError = (field) => {
    if (!attemptedNext) return "";
    if (field === 'iban' && !isValidIBAN(form.iban)) return "border-red";
    return !form[field] ? "border-red" : "";
  };

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
        {step === 1 && (
          <div className="fade-in">
            <div className="bper-legal-alert">
              <Info size={18} />
              <p>Rappel : Les virements hors zone SEPA sont soumis aux délais de compensation interbancaire internationaux.</p>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">COMPTE DE RÈGLEMENT</h3>
              <div className="account-preview-box">
                <div className="acc-info">
                    <span>{data.user?.nom} {data.user?.prenom}</span>
                    <small>Compte : {data.account?.accountNumber}</small>
                </div>
                <div className="acc-balance">
                    <label>Solde :</label>
                    <strong>{Number(data.account?.balance).toFixed(2)} €</strong>
                </div>
              </div>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">DÉTAILS DU BÉNÉFICIAIRE</h3>
              <input 
                type="text" 
                className={`bper-input ${checkError("beneficiaryName")}`} 
                placeholder="Nom du bénéficiaire *" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />
              <input 
                type="text" 
                className={`bper-input mono ${checkError("iban")}`} 
                placeholder="Saisissez l'IBAN (Auto-détection) *" 
                value={form.iban} 
                onChange={e => handleIbanAnalysis(e.target.value)} 
              />
              
              <div className="dual-input">
                <input type="text" className={`bper-input bg-locked ${checkError("bic")}`} placeholder="BIC (Auto) *" value={form.bic} readOnly />
                <input type="text" className={`bper-input bg-locked ${checkError("bankName")}`} placeholder="Banque (Auto) *" value={form.bankName} readOnly />
              </div>
              
              <div className="dual-input">
                <input type="number" className={`bper-input font-bold ${checkError("amount")}`} placeholder="Montant *" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option>EUR</option><option>USD</option>
                </select>
              </div>
              <input type="text" className={`bper-input ${checkError("motif")}`} placeholder="Motif du transfert *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title">
                  <Zap size={20} className="icon-zap" />
                  <div><strong>Virement instantané</strong><p className="opt-desc">Traitement en temps réel (si éligible).</p></div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={() => setIsInstant(!isInstant)} />
                  <span className="slider round"></span>
                </label>
              </div>
              {!isInternal && <div className="bper-warning-msg"><AlertTriangle size={14} /><span>Option restreinte à la zone SEPA.</span></div>}
            </div>

            <div className="bper-option-box">
              <div className="option-header">
                <div className="opt-title">
                  <Calendar size={20} className="icon-bank" />
                  <div><strong>Opération récurrente</strong><p className="opt-desc">Programmer ce virement périodiquement.</p></div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className={`bper-status-msg ${isRecurring ? 'status-ok' : 'status-warn'}`}>
                {isRecurring ? <><CheckCircle size={14} /> <span>Virement récurrent autorisé pour ce compte.</span></> : <><AlertTriangle size={14} /> <span>Option de récurrence non activée.</span></>}
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Date de crédit (Délai standard 48H)</label>
              <input type="date" className="bper-input" value={executionDate} min={new Date(Date.now() + 172800000).toISOString().split('T')[0]} onChange={(e) => setExecutionDate(e.target.value)} />
            </div>

            {error && <div className="error-alert-box"><XCircle size={16}/> {error}</div>}

            <button className="btn-continue-bper" onClick={validateStep1}>
              Continuer vers la signature <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF */}
        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérification des données SWIFT</h3>
            <div className="recap-container">
                <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                <div className="info-row"><label>Montant total :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                <div className="info-row"><label>Date de valeur :</label> <span>{executionDate}</span></div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Valider l'ordre de transfert</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : PIN */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Signature électronique en cours...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}><Lock size={40} className="text-blue" /></div>
                <h3>Sécurité BPER Banca</h3>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}></div>))}
                </div>
                <div className="numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (<button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>))}
                    <button className="btn-empty"></button>
                    <button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button>
                    <button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}>X</button>
                </div>
                {error && <div className="error-alert-virement"><XCircle size={20} /><p>{error}</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : SUCCÈS */}
        {step === 4 && (
          <div className="success-page fade-in">
             <CheckCircle size={80} color="#10b981" />
             <h2>Virement International Transmis</h2>
             <p>Référence SWIFT : {txRef}</p>
             <button className="btn-home-primary" onClick={() => navigate("/dashboard")}><Home size={18} /> Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}