import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { extractIBAN, isValidIBAN } from "ibantools"; 
import { 
  Globe, CheckCircle, Lock, Loader2, XCircle, Info, Zap, 
  Calendar, AlertTriangle, ArrowRight, Home, ChevronLeft
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
  
  // États des options bancaires
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

  // Initialisation de la date de valeur (J+2 minimum)
  useEffect(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    setExecutionDate(minDate.toISOString().split('T')[0]);
  }, []);

  // Chargement des données utilisateur
  useEffect(() => {
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Analyse de l'IBAN en temps réel
  const handleIbanAnalysis = (value) => {
    const cleanIban = value.toUpperCase().replace(/\s/g, '');
    let updatedForm = { ...form, iban: cleanIban };

    if (isValidIBAN(cleanIban)) {
      const ibanData = extractIBAN(cleanIban);
      const countryCode = cleanIban.substring(0, 2);
      const bankCode = ibanData.bank_code || "BSFT";

      // Génération du BIC et Nom de banque (Simulation professionnelle)
      updatedForm.bic = `${bankCode}${countryCode}BB111`.substring(0, 8);
      updatedForm.bankName = `BANQUE PARTENAIRE (${countryCode} - CODE ${bankCode})`;

      // Éligibilité Instantanée (Uniquement si Italie/BPER ou base locale)
      if (countryCode === "IT") {
        setIsInternal(true);
      } else {
        setIsInternal(false);
        setIsInstant(false);
      }
      setError("");
    } else {
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
      setError("Erreur : Veuillez renseigner tous les champs obligatoires (marqués en rouge).");
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
      setError(err.message.includes("base") 
        ? "Virement rejeté : Bénéficiaire non habilité en base de données. Contactez l'administrateur BPER." 
        : err.message);
    }
  };

  if (!data) return <div className="loading-screen">Initialisation des protocoles de sécurité...</div>;

  const isInvalid = (field) => {
    if (!attemptedNext) return false;
    if (field === 'iban') return !isValidIBAN(form.iban);
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
        {/* ÉTAPE 1 : CONFIGURATION */}
        {step === 1 && (
          <div className="fade-in">
            <div className="bper-legal-alert">
              <Info size={18} />
              <p>Conformément à la réglementation DSP2, les virements internationaux font l'objet d'une vérification de conformité.</p>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">COMPTE À DÉBITER</h3>
              <div className="account-preview-box">
                <div className="acc-info">
                    <span>{data.user?.nom} {data.user?.prenom}</span>
                    <small>IBAN: {data.account?.accountNumber}</small>
                </div>
                <div className="acc-balance">
                    <label>Solde :</label>
                    <strong>{Number(data.account?.balance).toFixed(2)} €</strong>
                </div>
              </div>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">COORDONNÉES DU BÉNÉFICIAIRE</h3>
              <input 
                type="text" 
                className={`bper-input ${isInvalid("beneficiaryName") ? "border-red" : ""}`} 
                placeholder="Nom complet du bénéficiaire *" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />
              <input 
                type="text" 
                className={`bper-input mono ${isInvalid("iban") ? "border-red" : ""}`} 
                placeholder="IBAN du bénéficiaire *" 
                value={form.iban} 
                onChange={e => handleIbanAnalysis(e.target.value)} 
              />
              
              <div className="dual-input">
                <input type="text" className={`bper-input bg-locked ${isInvalid("bic") ? "border-red" : ""}`} placeholder="BIC / SWIFT (Auto) *" value={form.bic} readOnly />
                <input type="text" className={`bper-input bg-locked ${isInvalid("bankName") ? "border-red" : ""}`} placeholder="Banque (Auto) *" value={form.bankName} readOnly />
              </div>
              
              <div className="dual-input">
                <input type="number" className={`bper-input font-bold ${isInvalid("amount") ? "border-red" : ""}`} placeholder="Montant *" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option>EUR</option><option>USD</option><option>GBP</option>
                </select>
              </div>
              <input type="text" className={`bper-input ${isInvalid("motif") ? "border-red" : ""}`} placeholder="Motif de l'opération (Obligatoire) *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title">
                  <Zap size={20} className="icon-zap" />
                  <div><strong>Virement instantané</strong><p className="opt-desc">Crédit immédiat (uniquement zone SEPA habilitée).</p></div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={() => setIsInstant(!isInstant)} />
                  <span className="slider round"></span>
                </label>
              </div>
              {!isInternal && <div className="bper-warning-msg"><AlertTriangle size={14} /><span>Virement instantané indisponible pour cette destination.</span></div>}
            </div>

            <div className="bper-option-box">
              <div className="option-header">
                <div className="opt-title">
                  <Calendar size={20} className="icon-bank" />
                  <div><strong>Opération récurrente</strong><p className="opt-desc">Mise en place d'un virement permanent.</p></div>
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

            <div className="form-section">
              <label className="section-title">Date d'exécution (Minimum 48H)</label>
              <input type="date" className="bper-input" value={executionDate} min={new Date(Date.now() + 172800000).toISOString().split('T')[0]} onChange={(e) => setExecutionDate(e.target.value)} />
            </div>

            {error && <div className="error-alert-box"><XCircle size={16}/> {error}</div>}

            <button className="btn-continue-bper" onClick={validateStep1}>
              Continuer vers la signature <ArrowRight size={18} />
            </button>
            <p className="footer-step-hint">Prochaine étape : signature digitale</p>
          </div>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF */}
        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérification des détails SWIFT</h3>
            <div className="recap-container">
                <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                <div className="info-row"><label>Date de valeur :</label> <span>{executionDate}</span></div>
                <div className="info-row"><label>Frais :</label> <span>0.00 EUR (Offre BPER Pro)</span></div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Confirmer et Signer</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier l'ordre</button>
          </div>
        )}

        {/* ÉTAPE 3 : SIGNATURE DIGITALE */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Authentification de l'ordre en cours...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}><Lock size={40} className={error ? "text-red" : "text-blue"} /></div>
                <h3>Confirmation BPER Secure</h3>
                <p>Saisissez votre code PIN à 5 chiffres pour signer</p>
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

        {/* ÉTAPE 4 : CONFIRMATION */}
        {step === 4 && (
          <div className="success-page fade-in">
             <CheckCircle size={80} color="#10b981" />
             <h2>Ordre SWIFT Transmis</h2>
             <p className="bper-subtitle">Votre virement international est enregistré sous la référence {txRef}.</p>
             <div className="mini-card-summary">
                <div className="summary-item"><label>Montant</label> <span>{form.amount} {form.currency}</span></div>
                <div className="summary-item"><label>Date valeur</label> <span>{executionDate}</span></div>
             </div>
             <button className="btn-home-primary" onClick={() => navigate("/dashboard")}>
                <Home size={18} /> Retour au tableau de bord
             </button>
          </div>
        )}
      </div>
    </div>
  );
}