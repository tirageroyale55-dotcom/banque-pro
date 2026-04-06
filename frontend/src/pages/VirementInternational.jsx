import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Globe, CheckCircle, Lock, Loader2, XCircle, Info, Zap, 
  Calendar, AlertTriangle, ArrowRight, Home, ArrowDown, User, CreditCard, Receipt, HelpCircle, MessageSquare
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

  // ✅ LOGIQUE D'ÉCHEC AUTOMATIQUE APRÈS PIN
  useEffect(() => {
    if (pin.length === 5 && step === 3) {
      simulateFailure();
    }
  }, [pin]);

  const simulateFailure = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4); // Vers la page d'erreur
    }, 2500);
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
      setError("Information manquante : Tous les champs sont obligatoires.");
      return false;
    }
    if (Number(amount) > userBalance) {
      setError("Solde insuffisant pour ce transfert international.");
      return false;
    }
    setError("");
    setStep(2);
  };

  if (!data) return <div className="loading-screen">Chargement sécurisé...</div>;

  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const accNum = data.account ? data.account.accountNumber : "Compte Courant";
  const userIban = data.account ? data.account.iban : "IT60 ************ 9901";
  const displayBalance = data.account ? data.account.balance : data.balance;
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="virement-wrapper">
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>
            {step === 4 ? "Fermer" : "Annuler"}
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
        {/* ÉTAPE 1 : FORMULAIRE */}
        {step === 1 && (
          <div className="fade-in">
            <div className="security-box">
              <CheckCircle size={18} />
              <p>Transfert SWIFT/International sécurisé. Les fonds sont protégés par le protocole BPER Secure.</p>
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
                  <option value="EUR">EUR (€)</option><option value="USD">USD ($)</option>
                </select>
                <input type="number" className="bper-input" placeholder="Montant 0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <input type="text" className="bper-input" placeholder="Motif du virement *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
            </div>

            <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title"><Zap size={20} className="icon-zap" /><div><strong>Virement instantané</strong><p className="opt-desc">La banque du Bénéficiaire permet d'activer cette modalité.</p></div></div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={!isInternal} checked={isInstant} onChange={toggleInstant} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className={`bper-option-box ${isInstant ? 'disabled-opt' : ''}`}>
              <div className="option-header">
                <div className="opt-title"><Calendar size={20} className="icon-bank" /><div><strong>Opération récurrente</strong><p className="opt-desc">Configuration d'un paiement automatique périodique.</p></div></div>
                <label className="bper-switch">
                  <input type="checkbox" disabled={isInstant} checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {error && <div className="error-msg"><AlertTriangle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={validateStep1}>Continuer vers le récapitulatif</button>
          </div>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF (STYLE VIREMENTFORM.JSX) */}
        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérifier les détail avant validation</h3>
            
            <div className="recap-container">
              {/* EXPÉDITEUR */}
              <div className="recap-group">
                <span className="group-label"><User size={14}/> DE (EXPÉDITEUR)</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Nom prénom :</label> <span>{userNom} {userPrenom}</span></div>
                  <div className="info-row"><label>Compte Débit :</label> <span>{accNum}</span></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{userIban}</span></div>
                  <div className="info-row"><label>Date virement :</label> <span>{today}</span></div>
                </div>
              </div>

              <div className="recap-divider"><ArrowDown size={20} /></div>

              {/* BÉNÉFICIAIRE */}
              <div className="recap-group">
                <span className="group-label"><CreditCard size={14}/> A (BÉNÉFICIAIRE)</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Nom prénom :</label> <strong>{form.beneficiaryName}</strong></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>Code Bic :</label> <span>{form.bic}</span></div>
                  <div className="info-row"><label>Banque :</label> <span>{form.bankName}</span></div>
                </div>
              </div>

              {/* TRANSACTION */}
              <div className="recap-group">
                <span className="group-label"><Receipt size={14}/> TRANSACTION</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                  <div className="info-row"><label>Frais :</label> <span className="free-tag">0,00 {form.currency}</span></div>
                  <div className="info-row"><label>Date de règlement :</label> <span>{executionDate}</span></div>
                  <div className="info-row"><label>Type de virement :</label> <span>{isInstant ? "Virement international instantané" : "Virement international standard"}</span></div>
                  <div className="info-row"><label>Motif :</label> <span>{form.motif}</span></div>
                </div>
              </div>
            </div>

            <button className="btn-continue" onClick={() => setStep(3)}>Signer numériquement</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {/* ÉTAPE 3 : PIN */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Analyse de conformité SWIFT en cours...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className="lock-header"><Lock size={40} className="text-blue" /></div>
                <h3>Signature Numérique</h3>
                <p>Saisissez votre code secret à 5 chiffres</p>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}></div>))}
                </div>
                <div className="numpad">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (<button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>))}
                  <button className="btn-empty"></button>
                  <button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button>
                  <button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}>X</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : MESSAGE D'ÉCHEC PROFESSIONNEL */}
        {step === 4 && (
          <div className="failure-view fade-in">
            <div className="failure-card">
              <div className="failure-icon-wrapper">
                <XCircle size={70} color="#e11d48" className="icon-failure-anim" />
              </div>
              <h2 className="text-red-title">Transaction échouée</h2>
              
              <div className="failure-alert-box">
                <p>Ce compte n'est pas autorisé à effectuer des virements internationaux vers le destinataire suivant :</p>
                <div className="failed-details-box">
                  <p><strong>Bénéficiaire :</strong> {form.beneficiaryName}</p>
                  <p><strong>IBAN :</strong> <span className="mono">{form.iban}</span></p>
                  <p><strong>Code BIC :</strong> {form.bic}</p>
                  <p><strong>Montant :</strong> {form.amount} {form.currency}</p>
                </div>
                <p className="activation-hint">
                  <strong>Action requise :</strong> Vous pouvez activer cette fonctionnalité immédiatement en contactant notre support technique pour vérifier votre identité et lever les restrictions de sécurité.
                </p>
              </div>

              <div className="failure-actions">
                <button className="btn-support-contact" onClick={() => window.location.href='/support'}>
                  <MessageSquare size={18} /> Contacter le support
                </button>
                <button className="btn-home-gray" onClick={() => navigate("/dashboard")}>
                  <Home size={18} /> Retour au tableau de bord
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}