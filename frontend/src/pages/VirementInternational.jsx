import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Globe, CheckCircle, Lock, Loader2, XCircle, Info, Zap, 
  Calendar, AlertTriangle, ArrowRight, Home, ArrowDown, User, CreditCard, Receipt, HelpCircle, ShieldAlert, MessageSquare
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
    api("/client/dashboard")
      .then((res) => setData(res))
      .catch(() => navigate("/login"));
  }, [navigate]);

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
    else setIsInternal(false);
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
      setError("Solde insuffisant pour cette opération.");
      return false;
    }
    setError("");
    setStep(2);
  };

  const processTransfer = async () => {
    setLoading(true);
    setError("");
    // Simulation d'un délai de traitement bancaire
    setTimeout(() => {
      setLoading(false);
      setStep(4); // On passe à l'affichage de l'échec
    }, 2500);
  };

  if (!data) return <div className="loading-screen">Chargement sécurisé...</div>;

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
          <span className="header-title">Virement International</span>
          <HelpCircle size={20} />
        </div>
        <div className="progress-container">
          <div className={`progress-bar step-${step > 3 ? 3 : step}`}></div>
          <span className="step-text">Étape {step > 3 ? "3" : step}/3</span>
        </div>
      </header>

      <div className="virement-content">
        {/* ÉTAPE 1 & 2 IDENTIQUES... */}
        {step === 1 && (
            <div className="fade-in">
                <div className="security-box">
                    <CheckCircle size={18} />
                    <p>Remplir le virement international. L'opération sera effectuée selon les protocoles de sécurité SWIFT.</p>
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
                    <div className="dual-input">
                        <select className="bper-input currency-select" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                        <input type="number" className="bper-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                    </div>
                    <input type="text" className="bper-input" placeholder="Motif *" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} />
                </div>

                <div className={`bper-option-box ${!isInternal ? 'disabled-opt' : ''}`}>
                    <div className="option-header">
                        <div className="opt-title"><Zap size={20} className="icon-zap" /><div><strong>Virement instantané</strong><p className="opt-desc">La banque du Bénéficiaire vous permet d'activer cette modalité.</p></div></div>
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

                {error && <div className="error-msg"><ShieldAlert size={16}/> {error}</div>}
                <button className="btn-continue" onClick={validateStep1}>Continuer vers le récapitulatif</button>
            </div>
        )}

        {step === 2 && (
          <div className="recap-page fade-in">
            <h3 className="recap-title">Vérifiez les détails avant validation</h3>
            <div className="recap-container">
              <div className="recap-group">
                <span className="group-label"><User size={14}/> EXPÉDITEUR</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Nom :</label> <span>{userNom} {userPrenom}</span></div>
                  <div className="info-row"><label>Compte :</label> <span>{accNum}</span></div>
                </div>
              </div>
              <div className="recap-divider"><ArrowDown size={20} /></div>
              <div className="recap-group">
                <span className="group-label"><CreditCard size={14}/> BÉNÉFICIAIRE</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Nom :</label> <strong>{form.beneficiaryName}</strong></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>BIC :</label> <span>{form.bic}</span></div>
                </div>
              </div>
              <div className="recap-group">
                <span className="group-label"><Receipt size={14}/> TRANSACTION</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                  <div className="info-row"><label>Type :</label> <span>Virement International</span></div>
                </div>
              </div>
            </div>
            <button className="btn-continue" onClick={() => setStep(3)}>Confirmer et signer</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier</button>
          </div>
        )}

        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Authentification de la transaction...</p>
              </div>
            ) : (
              <div className="pin-container">
                <div className="lock-header"><Lock size={40} className="text-blue" /></div>
                <h3>Signature BPER Secure</h3>
                <p>Saisissez votre code à 5 chiffres</p>
                <div className="pin-display">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}></div>))}
                </div>
                <div className="numpad">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (<button key={n} onClick={() => pin.length < 5 && setPin(pin + n)}>{n}</button>))}
                  <button className="btn-empty"></button>
                  <button onClick={() => pin.length < 5 && setPin(pin + "0")}>0</button>
                  <button className="btn-delete" onClick={() => setPin(pin.slice(0, -1))}><ArrowDown size={20} style={{ transform: "rotate(90deg)" }} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : MESSAGE D'ÉCHEC PROFESSIONNEL */}
        {step === 4 && (
          <div className="failure-view fade-in">
            <div className="status-badge-error">
              <XCircle size={80} color="#e11d48" className="icon-failure-anim" />
            </div>
            <h2 className="text-red title-failure">Transaction échouée</h2>
            
            <div className="error-report-card">
              <div className="error-header-msg">
                <ShieldAlert size={20} />
                <p><strong>Alerte de conformité :</strong> Ce compte n'est pas autorisé à effectuer des virements internationaux vers ce destinataire spécifique.</p>
              </div>

              <div className="rejected-details">
                <h4 className="detail-label">DÉTAILS DU DESTINATAIRE REJETÉ :</h4>
                <div className="detail-item"><label>Nom :</label> <span>{form.beneficiaryName}</span></div>
                <div className="detail-item"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                <div className="detail-item"><label>Code BIC :</label> <span>{form.bic}</span></div>
                <div className="detail-item"><label>Montant :</label> <span className="text-red font-bold">{form.amount} {form.currency}</span></div>
              </div>

              <div className="support-instruction">
                <Info size={16} />
                <p>Pour des raisons de sécurité, les transferts vers cette zone géographique nécessitent une activation manuelle de votre profil investisseur.</p>
                <p className="mt-2">Vous pouvez lever cette restriction immédiatement en contactant notre service assistance.</p>
              </div>
            </div>

            <div className="failure-actions">
              <button className="btn-support-contact" onClick={() => window.open('https://t.me/Support_bper_it', '_blank')}>
                <MessageSquare size={18} /> Contacter le support client
              </button>
              <button className="btn-home-secondary" onClick={() => navigate("/dashboard")}>
                <Home size={18} /> Retour au tableau de bord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}