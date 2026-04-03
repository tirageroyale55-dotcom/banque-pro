import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  CheckCircle, HelpCircle, AlertCircle, Lock, 
  ArrowDown, Info, Loader2, FileText, Home, XCircle, Download, Printer, Eye
} from "lucide-react";
import "../styles/virement.css";

export default function VirementForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false); // Nouvel état pour voir le rapport
  const [txRef] = useState(`BPER-${Math.random().toString(36).toUpperCase().substr(2, 9)}`);

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

  // ✅ AUTO-SUBMIT : Déclenchement automatique à 5 chiffres (comme ton controller)
  useEffect(() => {
    if (pin.length === 5 && step === 3) {
      confirmTransfer();
    }
  }, [pin]);

  const handleAccountBlur = async (e) => {
    const val = e.target.value.trim();
    if (val.length > 3) {
      try {
        const res = await api(`/transaction/check-recipient?accountNumber=${val}`, "GET");
        if (res && res.iban) {
          setForm(prev => ({
            ...prev,
            iban: res.iban,
            bic: res.bic || "BPERITM1XXX"
          }));
          setError("");
        }
      } catch (err) {
        setError("Destinataire introuvable ou numéro incorrect.");
        setForm(prev => ({ ...prev, iban: "", bic: "" }));
      }
    }
  };

  const nextStep = () => {
    setError("");
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
    setError("");
    try {
      await api("/transaction/transfer", "POST", {
        recipientIdentifier: form.iban,
        amount: form.amount,
        label: form.motif || "Virement SEPA Instantané",
        pin: pin 
      });
      setTimeout(() => {
        setLoading(false);
        setStep(4);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setPin("");
      setError(err.message || "Code PIN incorrect.");
    }
  };

  if (!data) return <div className="loading-screen">Chargement sécurisé...</div>;

  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const userIban = data.account ? data.account.iban : "IT60 ************ 9901"; // Fallback IBAN
  const userBic = "BPERITM1XXX"; // BIC standard BPER
  const accNum = data.account ? data.account.accountNumber : "Compte Courant";
  const displayBalance = data.account ? data.account.balance : data.balance;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
        {/* ÉTAPE 1 : SAISIE DES INFORMATIONS */}
        {step === 1 && (
          <>
            <div className="security-box">
              <CheckCircle size={18} />
              <p>Transfert sécurisé vers le réseau SEPA / Instantané.</p>
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
              <label className="section-title">Bénéficiaire</label>
              <input 
                type="text" 
                className="bper-input" 
                placeholder="Nom et Prénom du bénéficiaire*" 
                value={form.beneficiaryName} 
                onChange={e => setForm({...form, beneficiaryName: e.target.value})} 
              />
              <input 
                type="text" 
                className="bper-input" 
                placeholder="Numéro de compte*" 
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} 
                onBlur={handleAccountBlur}
              />
              <input 
                type="text" 
                className="bper-input read-only" 
                placeholder="IBAN (Remplissage automatique)" 
                value={form.iban} 
                readOnly 
              />
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
              <input 
                type="text" 
                className="bper-input" 
                placeholder="Motif (optionnel)" 
                value={form.motif} 
                onChange={e => setForm({...form, motif: e.target.value})} 
              />
            </div>

            {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
            <button className="btn-continue" onClick={nextStep}>Continuer vers le récapitulatif</button>
            <p className="step-hint">Prochaine étape : Confirmation des détails</p>
          </>
        )}

        {/* ÉTAPE 2 : RÉCAPITULATIF PROFESSIONNEL */}
        {step === 2 && (
          <div className="recap-page">
            <h3 className="recap-title">Vérifiez les détails avant validation</h3>
            
            <div className="recap-container">
              {/* SECTION DÉBITEUR */}
              <div className="recap-group">
                <span className="group-label">DE (EXPÉDITEUR)</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Nom :</label> <span>{userNom} {userPrenom}</span></div>
                  <div className="info-row"><label>Compte Débit :</label> <span>{accNum}</span></div>
                  <div className="info-row"><label>Date virement :</label> <span>{today}</span></div>
                </div>
              </div>

              <div className="recap-divider">
                <ArrowDown size={20} />
              </div>

              {/* SECTION BÉNÉFICIAIRE */}
              <div className="recap-group">
                <span className="group-label">À (BÉNÉFICIAIRE)</span>
                <div className="recap-card-info highlight">
                  <div className="info-row"><label>Bénéficiaire :</label> <strong>{form.beneficiaryName}</strong></div>
                  <div className="info-row"><label>Compte N° :</label> <span>{form.accountNumber}</span></div>
                  <div className="info-row"><label>IBAN :</label> <span className="mono">{form.iban}</span></div>
                  <div className="info-row"><label>Code BIC/SWIFT :</label> <span>{form.bic}</span></div>
                  <div className="info-row"><label>Banque :</label> <span>BPER Banca (International)</span></div>
                </div>
              </div>

              {/* SECTION FINANCIÈRE */}
              <div className="recap-group">
                <span className="group-label">TRANSACTION</span>
                <div className="recap-card-info">
                  <div className="info-row"><label>Montant :</label> <span className="heavy-amount">{form.amount} {form.currency}</span></div>
                  <div className="info-row"><label>Frais :</label> <span className="free-tag">0,00 € (Gratuit)</span></div>
                  <div className="info-row"><label>Date de règlement :</label> <span>Instantané</span></div>
                  <div className="info-row"><label>Type :</label> <span>Virement SEPA Instantané</span></div>
                  <div className="info-row"><label>Motif :</label> <span>{form.motif || "Virement sortant"}</span></div>
                </div>
              </div>
            </div>

            <div className="notice-box">
              <Info size={16} />
              <p><strong>NB:</strong> Cette transaction est <strong>instantanée</strong>. Veuillez bien vérifier les informations du bénéficiaire. Une fois validée, l'opération ne peut être annulée.</p>
            </div>

            <button className="btn-continue" onClick={nextStep}>Confirmer et signer</button>
            <button className="btn-back" onClick={() => setStep(1)}>Modifier les informations</button>
            <p className="step-hint">Dernière étape : Signature digitale (PIN)</p>
          </div>
        )}

        {/* ÉTAPE 3 : SIGNATURE DIGITALE (PIN 5 CHIFFRES) */}
        {step === 3 && (
          <div className="pin-page">
            {loading ? (
              <div className="bper-loader">
                <Loader2 size={50} className="animate-spin text-blue" />
                <p>Traitement de l'ordre de virement...</p>
                <small>Veuillez ne pas fermer cette fenêtre</small>
              </div>
            ) : (
              <div className="pin-container">
                <div className={`lock-header ${error ? "error-vibration" : ""}`}>
                  <Lock size={45} className={error ? "text-red" : "text-blue"} />
                </div>
                <h3>Code PIN de sécurité</h3>
                <p>Authentification requise pour valider le virement</p>
                
                <input 
                  type="password" 
                  maxLength="5" 
                  className={`pin-input-field ${error ? "input-red" : ""}`}
                  placeholder="• • • • •" 
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))} // Uniquement des chiffres
                  autoFocus 
                />

                {error && (
                  <div className="pin-error-msg">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : SUCCÈS & RAPPORT DÉTAILLÉ */}
        {step === 4 && (
          <div className={`success-view ${showReport ? 'viewing-report' : ''}`}>
            {!showReport ? (
              <div className="success-confirmation fade-in">
                <div className="status-badge">
                  <CheckCircle size={80} className="icon-success-anim" />
                </div>
                <h2 className="bper-title-success">Ordre de virement transmis</h2>
                <p className="bper-subtitle">Votre demande a été enregistrée avec succès par le réseau BPER Banca.</p>
                
                <div className="mini-card-summary">
                  <div className="summary-item"><label>Référence</label> <span>{txRef}</span></div>
                  <div className="summary-item"><label>Montant</label> <span className="amount-text">-{form.amount} {form.currency}</span></div>
                </div>

                <div className="success-actions-grid">
                  <button className="btn-view-report" onClick={() => setShowReport(true)}>
                    <Eye size={18} /> Voir le rapport complet
                  </button>
                  <button className="btn-home-primary" onClick={() => navigate("/dashboard")}>
                    <Home size={18} /> Retour à l'accueil
                  </button>
                </div>
              </div>
            ) : (
              <div className="bper-official-report fade-in">
                <div className="report-header">
                  <img src="/logo-bper.png" alt="BPER" className="report-logo" />
                  <div className="report-meta">
                    <h3>AVIS D'EXÉCUTION DE VIREMENT</h3>
                    <p>Référence : {txRef}</p>
                  </div>
                </div>

                <div className="report-greeting">
                  <p>Cher client(e) <strong>{userNom} {userPrenom}</strong>,</p>
                  <p>Nous vous confirmons l'exécution de l'opération effectuée ce jour via nos services digitaux.</p>
                </div>

                <div className="report-sections">
                  {/* EXPÉDITEUR */}
                  <div className="report-block">
                    <h4 className="block-title">DONNEUR D'ORDRE</h4>
                    <div className="block-content">
                      <div className="row"><span className="lbl">Nom :</span> <span>{userNom} {userPrenom}</span></div>
                      <div className="row"><span className="lbl">Compte N° :</span> <span>{accNum}</span></div>
                      <div className="row"><span className="lbl">IBAN :</span> <span className="mono">{userIban}</span></div>
                      <div className="row"><span className="lbl">Code BIC :</span> <span>{userBic}</span></div>
                    </div>
                  </div>

                  <div className="report-block">
                    <h4 className="block-title">BÉNÉFICIAIRE</h4>
                    <div className="block-content">
                      <div className="row"><span className="lbl">Nom :</span> <span>{form.beneficiaryName}</span></div>
                      <div className="row"><span className="lbl">Compte N° :</span> <span>{form.accountNumber}</span></div>
                      <div className="row"><span className="lbl">IBAN :</span> <span className="mono">{form.iban}</span></div>
                      <div className="row"><span className="lbl">Code BIC :</span> <span>{form.bic}</span></div>
                    </div>
                  </div>

                  <div className="report-block">
                    <h4 className="block-title">DÉTAILS DE LA TRANSACTION</h4>
                    <div className="block-content">
                      <div className="row"><span className="lbl">Date de l'opération :</span> <span>{today}</span></div>
                      <div className="row"><span className="lbl">Date de valeur :</span> <span>Instantané</span></div>
                      <div className="row"><span className="lbl">Montant du virement :</span> <span>{form.amount} {form.currency}</span></div>
                      <div className="row"><span className="lbl">Frais appliqués :</span> <span>0,00 EUR</span></div>
                      <div className="row font-bold"><span className="lbl">Total débité :</span> <span>{form.amount} {form.currency}</span></div>
                      <div className="row"><span className="lbl">Motif :</span> <span>{form.motif || "Virement sortant"}</span></div>
                      <div className="row"><span className="lbl">Type de virement :</span> <span>SEPA Instantané (Réseau BPER)</span></div>
                    </div>
                  </div>
                </div>

                <div className="report-footer-note">
                  <p>Document généré électroniquement. Ce document constitue une preuve de la transmission de l'ordre de virement sous réserve de provision suffisante.</p>
                </div>

                <div className="report-actions-footer no-print">
                  <button className="btn-print" onClick={() => window.print()}>
                    <Printer size={18} /> Imprimer le reçu
                  </button>
                  <button className="btn-download">
                    <Download size={18} /> Télécharger (PDF)
                  </button>
                  <button className="btn-close-report" onClick={() => setShowReport(false)}>
                    Fermer le rapport
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}