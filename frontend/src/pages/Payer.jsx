import { useState } from "react";
import { api } from "../services/api";

export default function Payer() {
  const [form, setForm] = useState({ id: "", amount: "", msg: "" });
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-content" style={{ paddingBottom: "100px" }}>
      <header className="section-header">
        <h2 className="cards-title">Payer</h2>
        <p className="subtitle">Envoyez de l'argent instantanément</p>
      </header>

      <div className="account-card" style={{ marginTop: "20px" }}>
        <div className="virement-form">
          <label className="input-label">Bénéficiaire (IBAN ou N° Compte)</label>
          <input 
            className="bank-input" 
            placeholder="IT37Q 05387..."
            value={form.id}
            onChange={e => setForm({...form, id: e.target.value})}
          />

          <label className="input-label" style={{ marginTop: "20px" }}>Montant (€)</label>
          <input 
            type="number"
            className="bank-input" 
            placeholder="0.00"
            style={{ fontSize: "24px", fontWeight: "bold" }}
            value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})}
          />

          <button className="btn-solid" style={{ width: "100%", marginTop: "30px" }}>
            Confirmer le virement
          </button>
        </div>
      </div>

      {/* Petit rappel de sécurité style BPER */}
      <div className="info-box" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <span style={{ color: "#005a64" }}>🛡️</span>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Les fonds seront transférés immédiatement après validation. Assurez-vous des coordonnées du destinataire.
        </p>
      </div>
    </div>
  );
}