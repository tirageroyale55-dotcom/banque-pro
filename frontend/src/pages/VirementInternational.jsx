import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Globe, CheckCircle, Lock, Loader2, XCircle, Info, Zap, 
  Calendar, AlertTriangle, ArrowRight, Home, ArrowDown, User, CreditCard, Receipt, HelpCircle, PhoneCall
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
  const [isRecurring, setIsRecurring] = useState(true); 
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

  const getStandardDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    setExecutionDate(getStandardDate());
  }, []);

  useEffect(() => {
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Déclenchement après le PIN
  useEffect(() => {
    if (pin.length === 5 && step === 3) {
      processTransfer();
    }
  }, [pin]);

  const toggleInstant = () => {
    const newInstantState = !isInstant;
    setIsInstant(newInstantState);
    if (newInstantState) {
      setExecutionDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
    } else {
      setExecutionDate(getStandardDate());
      setIsRecurring(true);
    }
  };

  const handleIbanInput = (value) => {
    const val = value.toUpperCase().replace(/\s/g, '');
    setForm({ ...form, iban: val });
    if (val.startsWith("IT")) setIsInternal(true);
    else {
      setIsInternal(false);
      setIsInstant(false);
      if (!isInstant) {
          setExecutionDate(getStandardDate());
          setIsRecurring(true);
      }
    }
  };

  const validateStep1 = () => {
    setAttemptedNext(true);
    const { beneficiaryName, iban, bic, bankName, amount, motif } = form;
    const userBalance = Number(data.account?.balance || data.balance || 0);

    if (!beneficiaryName || !iban || !bic || !bankName || !amount || !motif) {
      setError("Information manquante : Tous les champs sont obligatoires pour la conformité SWIFT.");
      return false;
    }
    if (Number(amount) > userBalance) {
      setError("Solde insuffisant : Le montant du virement dépasse votre plafond disponible.");
      return false;
    }
    setError("");
    setStep(2);
  };

  const processTransfer = () => {
    setLoading(true);
    setError("");
    // Simulation du refus de conformité internationale
    setTimeout(() => {
      setLoading(false);
      setStep(4); // On passe à l'étape du message d'erreur
    }, 2500);
  };

  if (!data) return <div className="loading-screen">Chargement sécurisé...</div>;

  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const accNum = data.account ? data.account.accountNumber : "Compte Courant";
  const userIban = data.account ? data.account.iban : "IT60 ************ 9901";
  const displayBalance = data.account ? data.account.balance : data.balance;

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            Annuler
          </button>
          <span className="header-title">Virement International</span>
          <HelpCircle size={20} />
        </div>
        <div className="progress-container">
          <div className={`progress-bar step-${step > 3 ? 3 : step}`}></div>
          <span className="step-text">Étape {step > 3 ? "3" : step}/3</span>
        </div>
      </header>

      <div className="virement-content">
        {step === 1 && (
          <div className="fade-in">
             <div className="security-box">
              <CheckCircle size={18} />
              <p>Remplir le virement international. L'opération sera effectuée selon des normes de sécurité élevées (SWIFT/SEPA).</p>
            </div>

            <div className="form-section">
              <label className="section-title">De (Compte à débiter)</label>
              <div className="account-selector-box highlight">
                <div className="user-info-row">
                  <span className="user-fullname">{userNom} {userPrenom}</span>
                  <span className="account-tag">PRINCIPAL</span>
                </div>
                <p className="acc-num">{accNum}</p>
                <div className="account-details">
                  <span className="label-gray">Solde disponible :</span>
                  <span className="amount-bold">{Number(displayBalance).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Bénéficiaire International</label>
              <input type="text" className="bper-input" placeholder="Nom du bénéficiaire *" value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})} />
              <input type="text" className="bper-input mono" placeholder="IBAN International *" value={form.iban} onChange={e => handleIbanInput(e.target.value)} />
              <div className="dual-input">
                <input type="text" className="bper-input" placeholder="Code BIC / SWIFT *" value={form.bic} onChange={e => setForm({...form, bic: e.target.value.toUpperCase()})} />
                <input type="text" className="bper-input" placeholder="Nom de la banque *" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
              </div>
            </div>

            <div className="form-section">
              <label className="section-title">Détails du transfert</label>
              <div className="dual-input">
                <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input type="number" className="bper-input" placeholder="Montant 0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <input type="text" className="bper-input" placeholder="Motif (Obligatoire) *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            {/* OPTIONS */}
            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title"><Zap size={20} className="icon-zap" /><div><strong>Virement instantané</strong><p className="opt-desc">La banque du Bénéficiaire vous permet d'activer cette modalité.</p></div></div>
                <label className="bper-switch"><input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={toggleInstant} /><span className="slider round"></span></label>
              </div>
            </div>

            <div className={`bper-option-box ${isInstant ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title"><Calendar size={20} className="icon-bank" /><div><strong>Opération récurrente</strong><p className="opt-desc">Vous permet de configurer un paiement automatique périodique.</p></div></div>
                <label className="bper-switch"><input type="checkbox" disabled={isInstant} checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} /><span className="slider round"></span></label>
              </div>
            </div>

            {error && <div className="error-msg"><AlertTriangle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={validateStep1}>Continuer vers le récapitulatif</button>
          </div>
        )}

        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérifier les détail avant validation</h3>
            
            <div className="recap-container">
              {/* EXPEDITEUR */}
              <div className="recap-group">
                <span className="group-label">DE (EXPÉDITEUR)</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Nom prénom :</label> <span>{userNom} {userPrenom}</span></div>
                  <div className="info-row"><label>Compte Débit :</label> <span>{accNum}</span></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{userIban}</span></div>
                  <div className="info-row"><label>Date virement :</label> <span>{new Date().toLocaleDateString()}</span></div>
                </div>
              </div>

              <div className="recap-divider"><ArrowDown size={20} /></div>

              {/* BENEFICIAIRE */}
              <div className="recap-group">
                <span className="group-label">A (BÉNÉFICIAIRE)</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Nom prénom :</label> <strong>{form.beneficiaryName}</strong></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>Code Bic :</label> <span>{form.bic}</span></div>
                  <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                </div>
              </div>

              {/* TRANSACTION */}
              <div className="recap-group">
                <span className="group-label">TRANSACTION</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                  <div className="info-row"><label>Frais :</label> <span>0,00 {form.currency}</span></div>
                  <div className="info-row"><label>Date de règlement :</label> <span>{executionDate}</span></div>
                  <div className="info-row"><label>Type de virement :</label> <span>Virement international {isInstant ? "instantané" : "standard"}</span></div>
                  <div className="info-row"><label>Motif :</label> <span>{form.motif}</span></div>
                </div>
              </div>
            </div>

            <button className="btn-continue" onClick={() => setStep(3)}>Signer numériquement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Authentification de l'ordre...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className="lock-header"><Lock size={40} className="text-blue" /></div>
                <h3>Signature BPER Secure</h3>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}></div>))}
                </div>
                <div className="numpad">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (<button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>))}
                  <button className="btn-empty"></button><button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button>
                  <button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}><ArrowDown size={20} style={{ transform: "rotate(90deg)" }} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="error-view fade-in">
            <div className="error-card-header">
              <XCircle size={80} color="#e11d48" className="icon-error-anim" />
              <h2 className="text-red">Transaction échouée</h2>
            </div>
            
            <div className="error-alert-content">
              <div className="bper-warning-box">
                <AlertTriangle size={24} className="text-red" />
                <p>
                  Ce compte n'est pas autorisé à effectuer des virements internationaux vers le bénéficiaire suivant :
                </p>
              </div>

              <div className="recap-card-error">
                <div className="info-row"><label>Bénéficiaire :</label> <span>{form.beneficiaryName}</span></div>
                <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                <div className="info-row"><label>Code BIC :</label> <span>{form.bic}</span></div>
                <div className="info-row"><label>Montant :</label> <span className="text-red font-bold">{form.amount} {form.currency}</span></div>
              </div>

              <div className="support-instruction">
                <p>Pour activer les virements vers cette destination, veuillez contacter immédiatement votre conseiller ou le support technique BPER.</p>
              </div>

              <div className="error-actions">
                <button className="btn-contact-support" onClick={() => window.location.href='mailto:support@bper.it'}>
                  <PhoneCall size={18} /> Contacter le support
                </button>
                <button className="btn-home-primary" onClick={() => navigate("/dashboard")}>
                  <Home size={18} /> Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}