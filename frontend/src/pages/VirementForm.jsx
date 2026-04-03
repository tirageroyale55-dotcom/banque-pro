import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ChevronLeft, Info, CheckCircle, HelpCircle } from "lucide-react";
import "../styles/virement.css";

export default function VirementForm() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    beneficiaryName: "",
    accountNumber: "",
    iban: "",
    bic: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    motif: ""
  });

  useEffect(() => {
    api("/client/dashboard").then(setData).catch(() => navigate("/login"));
  }, []);

  if (!data) return null;

  return (
    <div className="virement-wrapper">
      {/* HEADER AVEC BARRE DE PROGRESSION */}
      <header className="virement-header">
        <div className="header-top">
          <button className="btn-annuler" onClick={() => navigate("/payer")}>Annuler</button>
          <span className="header-title">Virement vers un compte</span>
          <HelpCircle size={20} className="help-icon" />
        </div>
        <div className="progress-container">
          <div className="progress-bar"></div>
          <span className="step-text">1 sur 2</span>
        </div>
      </header>

      <div className="virement-content">
        {/* BLOC SÉCURITÉ */}
        <div className="security-box">
          <CheckCircle size={20} className="check-icon" />
          <p>
            Remplir le virement bancaire. L'opération sera effectuée selon les normes de sécurité élevées. 
            <span className="details-link"> Détails</span>
          </p>
        </div>

        {/* SECTION: AU NOM DE (COMPTE EXPÉDITEUR) */}
        <div className="form-section">
          <label className="section-title">Au nom de</label>
          <div className="account-selector-box">
            <span className="account-name">Compte →</span>
            <div className="account-details">
              <span className="label-gray">Solde disponible :</span>
              <span className="amount-bold">{data.balance} €</span>
            </div>
          </div>
        </div>

        {/* SECTION: BÉNÉFICIAIRE */}
        <div className="form-section">
          <label className="section-title">Bénéficiaire</label>
          <input 
            type="text" 
            className="bper-input" 
            placeholder="Nom et prénom*" 
            value={form.beneficiaryName}
            onChange={(e) => setForm({...form, beneficiaryName: e.target.value})}
          />
          
          <div className="checkbox-row">
            <input type="checkbox" id="save" />
            <label htmlFor="save">Ajouter au carnet d'adresses</label>
          </div>

          <input 
            type="text" 
            className="bper-input" 
            placeholder="Numéro du compte"
            onChange={(e) => setForm({...form, accountNumber: e.target.value})}
          />
          <input 
            type="text" 
            className="bper-input" 
            placeholder="IBAN*"
            onChange={(e) => setForm({...form, iban: e.target.value})}
          />
          <input 
            type="text" 
            className="bper-input" 
            placeholder="Code BIC (SWIFT)"
            onChange={(e) => setForm({...form, bic: e.target.value})}
          />
        </div>

        {/* SECTION: MONTANT ET DATE */}
        <div className="form-section">
          <div className="input-with-symbol">
            <input 
              type="number" 
              className="bper-input" 
              placeholder="Montant"
              onChange={(e) => setForm({...form, amount: e.target.value})}
            />
            <span className="symbol">€</span>
          </div>
          
          <input 
            type="date" 
            className="bper-input" 
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
          />
          
          <input 
            type="text" 
            className="bper-input" 
            placeholder="Motif"
            onChange={(e) => setForm({...form, motif: e.target.value})}
          />
        </div>

        <button className="btn-continue" onClick={() => navigate("/payer/confirmation", { state: form })}>
          Continue
        </button>
        <p className="next-step-hint">Prochaine étape : Continuation</p>
      </div>
    </div>
  );
}