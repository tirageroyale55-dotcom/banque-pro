import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
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

  useEffect(() => {
    if (pin.length === 5 && step === 3) {
      processTransfer();
    }
  }, [pin]);

  // LOGIQUE DE SAISIE SIMPLE (SANS AUTO-COMPLÉTION)
  const handleIbanInput = (value) => {
    const val = value.toUpperCase().replace(/\s/g, '');
    setForm({ ...form, iban: val });
    
    // Détection uniquement pour l'activation visuelle de l'option instantanée
    if (val.startsWith("IT")) setIsInternal(true);
    else setIsInternal(false);
  };

  const validateStep1 = () => {
    setAttemptedNext(true);
    const { beneficiaryName, iban, bic, bankName, amount, motif } = form;
    
    if (!beneficiaryName || !iban || !bic || !bankName || !amount || !motif) {
      setError("Information manquante : Tous les champs  sont obligatoires pour la conformité SWIFT.");
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
      setError(err.message.includes("base") ? "Transfert refusé : IBAN non répertorié." : err.message);
    }
  };

  if (!data) return <div className="loading-screen">Chargement du terminal de paiement...</div>;

  const isInvalid = (field) => attemptedNext && !form[field];

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
              <p>Les virements hors zone SEPA sont soumis aux contrôles de la réglementation bancaire internationale.</p>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">COMPTE À DÉBITER</h3>
              <div className="account-preview-box">
                <div className="acc-info">
                    <span>{data.user?.nom} {data.user?.prenom}</span>
                    <small>Solde disponible :</small>
                </div>
                <div className="acc-balance">
                    <strong>{Number(data.account?.balance || data.balance).toFixed(2)} €</strong>
                </div>
              </div>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">DÉTAILS DU BÉNÉFICIAIRE</h3>
              <input 
                type="text" 
                className={`bper-input ${isInvalid("beneficiaryName") ? "border-red" : ""}`} 
                placeholder="Nom du bénéficiaire *" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />
              <input 
                type="text" 
                className={`bper-input mono ${isInvalid("iban") ? "border-red" : ""}`} 
                placeholder="IBAN *" 
                value={form.iban} 
                onChange={e => handleIbanInput(e.target.value)} 
              />
              
              <div className="dual-input">
                <input 
                  type="text" 
                  className={`bper-input ${isInvalid("bic") ? "border-red" : ""}`} 
                  placeholder="Code BIC / SWIFT *" 
                  value={form.bic} 
                  onChange={e => setForm({...form, bic: e.target.value.toUpperCase()})}
                />
                <input 
                  type="text" 
                  className={`bper-input ${isInvalid("bankName") ? "border-red" : ""}`} 
                  placeholder="Nom de la banque *" 
                  value={form.bankName} 
                  onChange={e => setForm({...form, bankName: e.target.value})}
                />
              </div>
              
              <div className="dual-input">
                <input type="number" className={`bper-input font-bold ${isInvalid("amount") ? "border-red" : ""}`} placeholder="Montant *" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option>EUR</option><option>USD</option><option>GBP</option>
                </select>
              </div>
              <input type="text" className={`bper-input ${isInvalid("motif") ? "border-red" : ""}`} placeholder="Motif du virement (Obligatoire) *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title"><Zap size={20} className="icon-zap" /><div><strong>Virement instantané</strong><p className="opt-desc">La banque du Bénéficiaire vous permet d'activer cette modalité.</p></div></div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={() => setIsInstant(!isInstant)} />
                  <span className="slider round"></span>
                </label>
              </div>
            {!isInternal && (
              <div className="bper-warning-msg">
                <AlertTriangle size={14} />
                <span>Il est possible d'envoyer des virements instantanés uniquement dans l'espace SEPA.</span>
              </div>
            )}
            </div>

            <div className="bper-option-box">
              <div className="option-header">
                <div className="opt-title"><Calendar size={20} className="icon-bank" /><div><strong>Opération récurrente</strong><p className="opt-desc">Vous permet de configurer un paiement automatique avec fréquence temporelle.</p></div></div>
                <label className="bper-switch">
                  <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className={`bper-status-msg ${isRecurring ? 'status-ok' : 'status-warn'}`}>
                {isRecurring ? <><CheckCircle size={14} /> <span>Il est possible de mettre en place un virement étranger récurrent.</span></> : <><AlertTriangle size={14} /> <span>Il n'est pas possible de mettre en place un virement étranger récurrent sans activation.</span></>}
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Date d'exécution (Minimum 48H)</label>
              <input type="date" className="bper-input" value={executionDate} min={new Date(Date.now() + 172800000).toISOString().split('T')[0]} onChange={(e) => setExecutionDate(e.target.value)} />
            </div>

            {error && <div className="error-alert-box"><XCircle size={16}/> {error}</div>}

            <button className="btn-continue-bper" onClick={validateStep1}>Continuer <ArrowRight size={18} /></button>
            <p className="footer-step-hint">Prochaine étape : Continuation</p>
          </div>
        )}

        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérification de l'ordre</h3>
            <div className="recap-container">
                <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Signer numériquement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {step === 3 && (
          <div className="pin-page">
            {loading ? <div className="bper-loader"><Loader2 size={50} className="animate-spin text-blue" /><p>Sécurisation de la transaction...</p></div> : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}><Lock size={40} className="text-blue" /></div>
                <h3>Confirmation BPER Secure</h3>
                <div className="pin-display">{[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}></div>))}</div>
                <div className="numpad">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (<button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>))}<button className="btn-empty"></button><button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button><button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}>X</button></div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="success-page fade-in">
             <CheckCircle size={80} color="#10b981" />
             <h2>Ordre SWIFT Transmis</h2>
             <p>Référence de l'opération : {txRef}</p>
             <button className="btn-home-primary" onClick={() => navigate("/dashboard")}><Home size={18} /> Retour au menu</button>
          </div>
        )}
      </div>
    </div>
  );
}