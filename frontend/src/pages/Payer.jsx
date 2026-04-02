import { useState } from "react";
import { api } from "../services/api";
import "../styles/dashboard.css";

export default function Payer() {
  const [form, setForm] = useState({ id: "", amount: "", msg: "" });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await api("/transaction/transfer", "POST", {
        recipientIdentifier: form.id,
        amount: form.amount,
        label: form.msg
      });
      setStep(2); // Succès
    } catch (err) {
      setError(err.message);
    }
  };

  if (step === 2) return (
    <div className="page-content" style={{textAlign:'center', paddingTop:'50px'}}>
      <div className="account-card">
        <h2 style={{color: '#005a64'}}>✓ Virement réussi</h2>
        <p>L'argent a été transféré instantanément.</p>
        <button className="btn-solid" onClick={() => window.location.reload()}>Nouveau virement</button>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <h2 className="cards-title">Payer / Virement</h2>
      
      <div className="account-card">
        <form onSubmit={handleSend}>
          <div className="item">
            <label>IBAN ou N° de compte destinataire</label>
            <input 
              className="bank-input" 
              placeholder="IT37Q..."
              value={form.id}
              onChange={e => setForm({...form, id: e.target.value})}
              required
            />
          </div>

          <div className="item" style={{marginTop:'15px'}}>
            <label>Montant (€)</label>
            <input 
              type="number" 
              className="bank-input"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              required
            />
          </div>

          <div className="item" style={{marginTop:'15px'}}>
            <label>Motif de l'opération</label>
            <input 
              className="bank-input"
              value={form.msg}
              onChange={e => setForm({...form, msg: e.target.value})}
            />
          </div>

          {error && <p className="form-error" style={{marginTop:'15px'}}>{error}</p>}

          <button className="btn-solid" style={{width:'100%', marginTop:'20px'}}>
            Confirmer le virement
          </button>
        </form>
      </div>

      <div className="account-card" style={{marginTop:'20px', opacity: 0.7}}>
        <h3>Aide</h3>
        <p style={{fontSize:'12px'}}>Seuls les virements vers les comptes du réseau BPER sont autorisés pour le moment.</p>
      </div>
    </div>
  );
}