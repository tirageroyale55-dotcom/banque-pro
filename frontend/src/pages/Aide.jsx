import { useState } from "react";
import { api } from "../services/api"; 
import "../styles/Aide.css"; // Ajustez le chemin vers votre fichier CSS

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
      // Envoi de la demande d'assistance
      await api("/auth/support/ticket", "POST", formData);
      setSuccess(true);
      setFormData({ category: "TECHNICAL_SUPPORT", subject: "", message: "" });
    } catch (err) {
      setError("Une erreur est survenue lors de la transmission. Veuillez réessuyer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDesktop ? "aide-page-wrapper desktop" : "page-content aide-page-wrapper"}>
      <div className="aide-container">
        <h2 className="aide-title">Centre de Support & Assistance</h2>
        <p className="aide-subtitle">
          BPER Banca met à votre disposition ses canaux d'assistance prioritaire pour la gestion de vos comptes et services numériques.
        </p>

        <div className="support-grid">
          
          
          {/* CANAUX DIRECTS */}
          <div className="info-card-channels">
            <h3><i className="fas fa-phone-alt"></i> Lignes Directes d'Urgence</h3>
            <div className="channels-subgrid">
              <div className="channel-item">
                <p className="channel-label">📞 Servizio Clienti (Service Client)</p>
                <p className="channel-desc">Disponible 24h/7j (Appel international)</p>
                <p className="channel-value">+39 059 4242</p>
              </div>
              <div className="channel-item">
                <p className="channel-label">📧 Support Institutionnel</p>
                <p className="channel-desc">Pour les demandes administratives globales</p>
                <p className="channel-value">support@bper.it</p>
              </div>
            </div>
          </div>

          {/* MESSAGERIE SÉCURISÉE */}
          <div className="secure-msg-card">
            <h3><i className="fas fa-envelope-shield"></i> Messagerie Sécurisée</h3>
            <p className="card-notice">
              Toute communication transmise via ce formulaire est cryptée et directement assignée à un conseiller de l'administration BPER Banca.
            </p>

            {success && (
              <div className="alert-box success">
                <i className="fas fa-check-circle"></i> 
                Votre ticket d'assistance a été enregistré. Un administrateur traitera votre demande sous 24h ouvrées.
              </div>
            )}

            {error && (
              <div className="alert-box error">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="secure-form">
              <div className="form-group">
                <label>Typologie de l'incident (Objet)</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="TECHNICAL_SUPPORT">Incident technique / Accès E-Banking</option>
                  <option value="CARD_ISSUE">Dysfonctionnement ou opposition Carte Bancaire</option>
                  <option value="TRANSACTION_DISPUTE">Contestation d'opération / Flux monétique</option>
                  <option value="LOAN_FOLLOW_UP">Suivi de demande de prêt / Crédit en cours</option>
                  <option value="COMPLIANCE_DOCS">Soumission ou anomalie sur pièces justificatives</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sujet de la requête</label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  placeholder="Ex: Refus de paiement carte / Erreur d'envoi du justificatif"
                  value={formData.subject} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Description détaillée des faits</label>
                <textarea 
                  name="message" 
                  required 
                  placeholder="Veuillez décrire avec précision les difficultés rencontrées (dates, montants, messages d'erreur affichés)..."
                  value={formData.message} 
                  onChange={handleChange} 
                />
              </div>

              <button type="submit" disabled={loading} className="btn-submit-secure">
                {loading ? "Transmission sécurisée en cours..." : "Transmettre la demande à l'administration"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}