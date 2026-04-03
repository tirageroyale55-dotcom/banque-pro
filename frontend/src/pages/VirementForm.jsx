import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { CheckCircle, HelpCircle, AlertCircle, Lock, ArrowDown, Info } from "lucide-react";
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
    try {
      await api("/transaction/transfer", "POST", {
        recipientIdentifier: form.iban,
        amount: form.amount,
        label: form.motif || "Virement SEPA",
        pin: pin
      });
      setStep(4);
    } catch (err) {
      setError(err.message || "Code PIN incorrect.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="loading-screen">Chargement sécurisé...</div>;

  const userNom = data.user ? data.user.nom : data.lastname;
  const userPrenom = data.user ? data.user.prenom : data.firstname;
  const accNum = data.account ? data.account.accountNumber : "Compte Courant";
  const displayBalance = data.account ? data.account.balance : data.balance;
  const today = new Date().toLocaleDateString('fr-FR');

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

        {/* ÉTAPE 3 : PIN */}
        {step === 3 && (
          <div className="pin-page">
            <Lock size={40} className="lock-icon" />
            <h3>Signature Digitale</h3>
            <p>Saisissez votre code secret pour autoriser le virement instantané.</p>
            <input 
              type="password" 
              maxLength="6" 
              className="pin-input" 
              placeholder="••••••" 
              onChange={e => setPin(e.target.value)} 
              autoFocus 
            />
            {error && <p className="error-text" style={{color:'red', marginTop:'10px'}}>{error}</p>}
            <button className="btn-continue" disabled={loading} onClick={confirmTransfer}>
              {loading ? "Validation en cours..." : "Valider le virement"}
            </button>
          </div>
        )}

        {/* ÉTAPE 4 : SUCCÈS */}
        {step === 4 && (
          <div className="success-page">
            <div className="success-circle">✓</div>
            <h2>Opération réussie</h2>
            <p>Le virement de <strong>{form.amount} {form.currency}</strong> a été transmis avec succès à <strong>{form.beneficiaryName}</strong>.</p>
            <div className="success-details">
              <p>Référence : BPER-{Math.floor(Math.random() * 1000000)}</p>
              <p>Statut : Exécuté</p>
            </div>
            <button className="btn-continue" onClick={() => navigate("/dashboard")}>Retour au tableau de bord</button>
          </div>
        )}
      </div>
    </div>
  );
}