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

  // LOGIQUE UNIVERSELLE : EXTRACTION DU BIC DEPUIS L'IBAN
  const handleIbanInput = (value) => {
    const cleanIban = value.toUpperCase().replace(/\s/g, '');
    let updatedForm = { ...form, iban: cleanIban };

    if (isValidIBAN(cleanIban)) {
      const ibanInfo = extractIBAN(cleanIban);
      const country = cleanIban.substring(0, 2);
      
      // La plupart des BIC commencent par le Bank Code (4 à 6 caractères)
      // On extrait le bank_code fourni par ibantools ou on le slice manuellement
      const extractedBankCode = ibanInfo.bank_code || cleanIban.substring(4, 8);
      
      // Génération du BIC SWIFT Probable : [BANK CODE] + [COUNTRY CODE] + "BBXXX"
      // C'est la structure standard ISO pour un BIC à 8 caractères
      const generatedBic = `${extractedBankCode}${country}BB111`.substring(0, 8);
      
      updatedForm.bic = generatedBic;
      
      // Si c'est un IBAN italien, on active les options locales BPER
      setIsInternal(country === "IT");
      setError("");
    } else {
      updatedForm.bic = "";
      setIsInternal(false);
    }
    setForm(updatedForm);
  };

  const validateStep1 = () => {
    setAttemptedNext(true);
    const { beneficiaryName, iban, bic, bankName, amount, motif } = form;
    
    // Validation stricte de tous les champs
    if (!beneficiaryName || !iban || !bic || !bankName || !amount || !motif || !isValidIBAN(iban)) {
      setError("Information manquante : Tous les champs marqués en rouge sont obligatoires.");
      return false;
    }
    setError("");
    setStep(2);
  };

  const processTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      await api("/transaction/transfer-international", "POST", { ...form, pin, executionDate });
      setTimeout(() => { setLoading(false); setStep(4); }, 2500);
    } catch (err) {
      setLoading(false);
      setPin("");
      setError(err.message.includes("base") ? "Accès refusé : Bénéficiaire non présent dans le registre de sécurité." : err.message);
    }
  };

  if (!data) return <div className="loading-screen">Sécurisation du canal SWIFT...</div>;

  const isInvalid = (field) => {
    if (!attemptedNext) return false;
    if (field === "iban") return !isValidIBAN(form.iban);
    return !form[field];
  };

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            {step === 4 ? "Terminer" : "Annuler"}
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
              <p>Rappel : Les virements transfrontaliers sont soumis aux contrôles de conformité KYC et AML.</p>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">COORDONNÉES DU BÉNÉFICIAIRE</h3>
              
              {/* NOM DU BÉNÉFICIAIRE */}
              <input 
                type="text" 
                className={`bper-input ${isInvalid("beneficiaryName") ? "border-red" : ""}`} 
                placeholder="Nom complet du bénéficiaire *" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />

              {/* IBAN : DECLENCHE LE BIC AUTOMATIQUE */}
              <input 
                type="text" 
                className={`bper-input mono ${isInvalid("iban") ? "border-red" : ""}`} 
                placeholder="IBAN (International) *" 
                value={form.iban} 
                onChange={e => handleIbanInput(e.target.value)} 
              />
              
              {/* BIC AUTOMATIQUE ET NOM DE BANQUE MANUEL */}
              <div className="dual-input">
                <input 
                    type="text" 
                    className={`bper-input bg-locked ${isInvalid("bic") ? "border-red" : ""}`} 
                    placeholder="Code BIC (Détecté) *" 
                    value={form.bic} 
                    readOnly 
                />
                <input 
                    type="text" 
                    className={`bper-input ${isInvalid("bankName") ? "border-red" : ""}`} 
                    placeholder="Nom de la banque *" 
                    value={form.bankName} 
                    onChange={e => setForm({...form, bankName: e.target.value})} 
                />
              </div>
              
              {/* MONTANT ET DEVISE */}
              <div className="dual-input">
                <input 
                  type="number" 
                  className={`bper-input font-bold ${isInvalid("amount") ? "border-red" : ""}`} 
                  placeholder="Montant *" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                />
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option>EUR</option><option>USD</option><option>GBP</option><option>CHF</option>
                </select>
              </div>

              {/* MOTIF OBLIGATOIRE */}
              <input 
                type="text" 
                className={`bper-input ${isInvalid("motif") ? "border-red" : ""}`} 
                placeholder="Motif de l'opération (Obligatoire) *" 
                value={form.motif} 
                onChange={e => setForm({...form, motif: e.target.value})} 
              />
            </div>

            {/* OPTIONS DE PAIEMENT */}
            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title">
                  <Zap size={20} className="icon-zap" />
                  <div><strong>Virement instantané</strong><p className="opt-desc">Disponible uniquement pour les banques compatibles SEPA.</p></div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={() => setIsInstant(!isInstant)} />
                  <span className="slider round"></span>
                </label>
              </div>
              {!isInternal && <div className="bper-warning-msg"><AlertTriangle size={14} /><span>L'IBAN saisi ne permet pas le règlement instantané.</span></div>}
            </div>

            <div className="bper-option-box">
              <div className="option-header">
                <div className="opt-title">
                  <Calendar size={20} className="icon-bank" />
                  <div><strong>Opération récurrente</strong><p className="opt-desc">Programmer un virement permanent.</p></div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className={`bper-status-msg ${isRecurring ? 'status-ok' : 'status-warn'}`}>
                {isRecurring ? <><CheckCircle size={14} /> <span>Il est possible de mettre en place un virement étranger récurrent.</span></> : <><AlertTriangle size={14} /> <span>Il n'est pas possible de mettre en place un virement étranger récurrent.</span></>}
              </div>
            </div>

            {/* DATE DE VALEUR */}
            <div className="form-section">
              <label className="section-title">Date d'exécution (Délai min. 48H)</label>
              <input 
                type="date" 
                className="bper-input" 
                value={executionDate} 
                min={new Date(Date.now() + 172800000).toISOString().split('T')[0]} 
                onChange={(e) => setExecutionDate(e.target.value)} 
              />
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
            <h3 className="recap-title">Confirmation de l'ordre de transfert</h3>
            <div className="recap-container">
                <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                <div className="info-row"><label>BIC / SWIFT :</label> <span>{form.bic}</span></div>
                <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                <div className="info-row"><label>Date de valeur :</label> <span>{executionDate}</span></div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Signer numériquement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : PIN CODE */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Validation des protocoles SWIFT...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}><Lock size={40} className={error ? "text-red" : "text-blue"} /></div>
                <h3>Signature BPER Secure</h3>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""} ${error ? "dot-error" : ""}`}></div>))}
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

        {/* ÉTAPE 4 : RÉUSSITE */}
        {step === 4 && (
          <div className="success-page fade-in">
             <CheckCircle size={80} color="#10b981" />
             <h2>Ordre de virement transmis</h2>
             <p className="bper-subtitle">Votre demande est en cours de traitement. Référence : {txRef}</p>
             <button className="btn-home-primary" onClick={() => navigate("/dashboard")}><Home size={18} /> Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}