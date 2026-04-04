import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Globe, CheckCircle, HelpCircle, AlertCircle, Lock, 
  Loader2, FileText, Home, XCircle, Info, Zap, Calendar, 
  AlertTriangle, ArrowRight 
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
  
  // États pour les options bancaires
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

  // Calcul de la date minimale (J+2 soit 48h)
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
      processInternationalTransfer();
    }
  }, [pin]);

  // Vérification si l'IBAN est dans la base (Simulation locale + logique métier)
  const handleIbanCheck = async (iban) => {
    const val = iban.trim().toUpperCase();
    setForm({ ...form, iban: val });

    if (val.length > 5) {
      try {
        // On vérifie si l'IBAN existe dans notre base via l'endpoint existant
        const res = await api(`/transaction/check-recipient?accountNumber=${val}`, "GET");
        if (res && res.iban) {
          setIsInternal(true);
        } else {
          setIsInternal(false);
          setIsInstant(false); // Désactive l'instantané si hors base
        }
      } catch (err) {
        setIsInternal(false);
        setIsInstant(false);
      }
    }
  };

  const processInternationalTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      await api("/transaction/transfer-international", "POST", {
        iban: form.iban,
        amount: form.amount,
        pin: pin,
        label: form.motif,
        executionDate: executionDate,
        isInstant: isInstant
      });

      setTimeout(() => {
        setLoading(false);
        setStep(4);
      }, 2500);

    } catch (err) {
      setLoading(false);
      setPin("");
      if (err.message.includes("not found") || err.message.includes("base")) {
        setError("Virement non effectué : Les coordonnées bancaires (IBAN) saisies ne sont pas enregistrées dans notre base de données sécurisée. Veuillez contacter votre conseiller ou l'administrateur BPER pour habiliter ce bénéficiaire.");
      } else {
        setError(err.message || "Échec de l'authentification de la transaction.");
      }
    }
  };

  if (!data) return <div className="loading-screen">Vérification des protocoles SWIFT...</div>;

  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const accNum = data.account ? data.account.accountNumber : "Compte Principal";
  const displayBalance = data.account ? data.account.balance : data.balance;

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
        {/* ÉTAPE 1 : CONFIGURATION DE L'ORDRE */}
        {step === 1 && (
          <div className="fade-in">
            <div className="bper-legal-alert">
              <Info size={18} />
              <p>Les virements hors zone SEPA sont soumis aux contrôles de la réglementation bancaire internationale.</p>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">DE (COMPTE À DÉBITER)</h3>
              <div className="account-preview-box">
                <div className="acc-info">
                  <span className="acc-owner">{userNom} {userPrenom}</span>
                  <span className="acc-number">N° Compte: {accNum}</span>
                </div>
                <div className="acc-balance">
                  <label>Solde disponible :</label>
                  <strong>{Number(displayBalance).toFixed(2)} €</strong>
                </div>
              </div>
            </div>

            <div className="bper-card-section">
              <h3 className="section-label">BÉNÉFICIAIRE & DESTINATION</h3>
              <input type="text" className="bper-input" placeholder="Nom complet du bénéficiaire" onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input mono" placeholder="IBAN International" onBlur={(e) => handleIbanCheck(e.target.value)} onChange={e => setForm({...form, iban: e.target.value.toUpperCase()})} />
              <div className="dual-input">
                <input type="text" className="bper-input" placeholder="Code BIC / SWIFT" onChange={e => setForm({...form, bic: e.target.value.toUpperCase()})} />
                <input type="text" className="bper-input" placeholder="Banque de destination" onChange={e => setForm({...form, bankName: e.target.value})} />
              </div>
              <div className="dual-input">
                <input type="number" className="bper-input font-bold" placeholder="Montant 0.00" onChange={e => setForm({...form, amount: e.target.value})} />
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* OPTION : VIREMENT INSTANTANÉ */}
            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title">
                  <Zap size={20} className="icon-zap" />
                  <div>
                    <strong>Virement instantané</strong>
                    <p className="opt-desc">La banque du Bénéficiaire vous permet d'activer cette modalité.</p>
                  </div>
                </div>
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

            {/* OPTION : OPÉRATION RÉCURRENTE */}
            <div className="bper-option-box">
              <div className="option-header">
                <div className="opt-title">
                  <Calendar size={20} className="icon-bank" />
                  <div>
                    <strong>Opération récurrente</strong>
                    <p className="opt-desc">Configuration d'un paiement automatique avec fréquence temporelle.</p>
                  </div>
                </div>
                <label className="bper-switch">
                  <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className={`bper-status-msg ${isRecurring ? 'status-ok' : 'status-warn'}`}>
                {isRecurring ? (
                  <><CheckCircle size={14} /> <span>Il est possible de mettre en place un virement étranger récurrent.</span></>
                ) : (
                  <><AlertTriangle size={14} /> <span>Il n'est pas possible de mettre en place un virement étranger récurrent.</span></>
                )}
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Date de règlement (Minimum 48h)</label>
              <input 
                type="date" 
                className="bper-input" 
                value={executionDate}
                min={new Date(Date.now() + 172800000).toISOString().split('T')[0]} 
                onChange={(e) => setExecutionDate(e.target.value)}
              />
            </div>

            <input type="text" className="bper-input" placeholder="Motif du transfert" onChange={e => setForm({...form, motif: e.target.value})} />

            <button className="btn-continue-bper" onClick={() => setStep(2)}>
              Continuer <ArrowRight size={18} />
            </button>
            <p className="footer-step-hint">Prochaine étape : continuation</p>
          </div>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF */}
        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Validation des détails SWIFT</h3>
            <div className="recap-container">
              <div className="recap-group">
                <span className="group-label">DESTINATION</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                </div>
              </div>
              <div className="recap-group">
                <span className="group-label">EXÉCUTION</span>
                <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                <div className="info-row"><label>Date de valeur :</label> <span>{executionDate}</span></div>
                <div className="info-row"><label>Type :</label> <span>{isInstant ? "Instantané" : "Standard International"}</span></div>
              </div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Signer l'ordre de virement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : SIGNATURE PIN */}
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
                <p>Saisissez votre code de signature à 5 chiffres</p>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""} ${error ? "dot-error" : ""}`}></div>
                  ))}
                </div>
                <div className="numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>
                    ))}
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
             <div className="status-badge"><CheckCircle size={80} color="#10b981" /></div>
             <h2>Ordre SWIFT Transmis</h2>
             <p className="bper-subtitle">Votre virement international est en cours de traitement par le service conformité.</p>
             <div className="mini-card-summary">
                <div className="summary-item"><label>Référence</label> <span>{txRef}</span></div>
                <div className="summary-item"><label>Date de valeur</label> <span>{executionDate}</span></div>
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