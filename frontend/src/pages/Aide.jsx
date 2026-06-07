import { useState } from "react";
import { api } from "../../services/api"; // Assurez-vous que le chemin est correct

export default function Aide({ isDesktop = false }) {
  const [formData, setFormData] = useState({
    category: "TECHNICAL_SUPPORT",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Appel à votre API backend pour enregistrer la demande d'assistance
      await api("/support/ticket", "POST", formData);
      setSuccess(true);
      setFormData({ category: "TECHNICAL_SUPPORT", subject: "", message: "" });
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de votre requête. Veuillez réessuyer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDesktop ? "" : "page-content"} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="cards-title">Centre de Support & Assistance</h2>
      <p style={{ color: '#64748b', marginBottom: '20px', marginTop: '-10px', fontSize: '0.95rem' }}>
        BPER Banca met à votre disposition ses canaux d'assistance prioritaire pour la gestion de vos comptes et services numériques.
      </p>

      <div className="master-grid" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* BLOC 1 : CONTACTS OFFICIELS DIRECTS */}
        <div className="account-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#004f52', marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>
            <i className="fas fa-phone-alt" style={{ marginRight: '10px' }}></i> Lignes Directes d'Urgence
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="item">
              <p style={{ margin: '0 0 5px 0' }}><b>📞 Servizio Clienti (Service Client)</b></p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Disponible 24h/7j (Appel international)</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#004f52' }}>+39 059 4242</p>
            </div>
            <div className="item">
              <p style={{ margin: '0 0 5px 0' }}><b>📧 Support Institutionnel</b></p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Pour les demandes administratives globales</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#004f52' }}>support@bper.it</p>
            </div>
          </div>
        </div>

        {/* BLOC 2 : FORMULAIRE DE MESSAGERIE SÉCURISÉE */}
        <div className="account-card" style={{ padding: '25px', borderRadius: '12px' }}>
          <h3 style={{ color: '#004f52', marginTop: 0, marginBottom: '5px', fontSize: '1.1rem' }}>
            <i className="fas fa-envelope-shield" style={{ marginRight: '10px' }}></i> Messagerie Sécurisée
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
            Toute communication transmise via ce formulaire est cryptée et directement assignée à un conseiller de l'administration BPER Banca.
          </p>

          {success && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> 
              Votre ticket d'assistance a été enregistré avec succès. Un administrateur prendra en charge votre demande sous 24h ouvrées.
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Typologie de l'incident (Objet)</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem' }}
              >
                <option value="TECHNICAL_SUPPORT">Incident technique / Accès E-Banking</option>
                <option value="CARD_ISSUE">Dysfonctionnement ou opposition Carte Bancaire</option>
                <option value="TRANSACTION_DISPUTE">Contestation d'opération / Flux monétique</option>
                <option value="LOAN_FOLLOW_UP">Suivi de demande de prêt / Crédit en cours</option>
                <option value="COMPLIANCE_DOCS">Soumission ou anomalie sur pièces justificatives</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Sujet de la requête</label>
              <input 
                type="text"
                name="subject"
                required
                placeholder="Ex: Refus de paiement carte Gold / Erreur de téléchargement du justificatif"
                value={formData.subject}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Description détaillée des faits</label>
              <textarea 
                name="message"
                required
                placeholder="Veuillez décrire avec précision les difficultés rencontrées (dates, montants, messages d'erreur affichés)..."
                value={formData.message}
                onChange={handleChange}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '120px', resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                backgroundColor: '#004f52', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '6px', 
                border: 'none', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '10px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Transmission sécurisée en cours..." : "Transmettre la demande à l'administration"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}