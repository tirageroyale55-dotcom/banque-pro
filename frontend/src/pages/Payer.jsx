import { useState } from "react";
import { api } from "../services/api";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import "../styles/dashboard.css"; // Réutilise tes styles pour la cohérence

export default function Payer() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ identifier: "", amount: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api("/client/transfer", "POST", {
        recipientIdentifier: form.identifier,
        amount: form.amount,
        reason: form.reason
      });
      setStep(3); // Succès
    } catch (err) {
      setError(err.message || "Destinataire introuvable dans le réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-app">
      <div className="page-content" style={{ paddingBottom: "100px" }}>
        <h2 className="cards-title">Virement Instantané</h2>

        <div className="account-card" style={{ margin: "20px" }}>
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <label>IBAN ou N° de compte du destinataire</label>
              <input 
                className="bank-input"
                placeholder="Ex: IT37Q..." 
                value={form.identifier}
                onChange={e => setForm({...form, identifier: e.target.value})}
                required
              />
              <button className="btn-solid" style={{ marginTop: "20px", width: "100%" }}>Vérifier</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleTransfer}>
              <p>Vers : <b>{form.identifier}</b></p>
              <label>Montant (€)</label>
              <input 
                type="number" 
                className="bank-input"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
              <label>Motif (optionnel)</label>
              <input 
                className="bank-input"
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
              />
              
              {error && <p className="form-error" style={{ color: "red" }}>{error}</p>}
              
              <button disabled={loading} className="btn-solid" style={{ marginTop: "20px", width: "100%" }}>
                {loading ? "Traitement..." : "Confirmer le virement"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-light">Retour</button>
            </form>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "50px", color: "#005a64" }}>✓</div>
              <h3>Virement envoyé</h3>
              <p>Le compte {form.identifier} a été crédité.</p>
              <button onClick={() => window.location.reload()} className="btn-solid">Nouveau virement</button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}