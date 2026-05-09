import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, User, Landmark, CalendarDays, Send } from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  // Données utilisateur simulées (devraient idéalement venir d'un contexte d'authentification)
  const user = {
    firstName: "Jean",
    lastName: "Dupont",
    linkedAccount: "FR76 1234 5678 9012 3456 7890 123", // IBAN simulé
    currentDate: new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  useEffect(() => {
    // Force le scroll tout en haut
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.scrollTop = 0;
  }, []);

  if (!card) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>Impossible de récupérer les détails de la carte.</p>
        <button onClick={() => navigate('/catalog')}>Retour au catalogue</button>
      </div>
    );
  }

  const handleSendRequest = (e) => {
    e.preventDefault();
    // Logique d'envoi de la demande (API call)
    console.log("Demande envoyée pour la carte:", card.name);
    // Redirection vers une page de succès ou affichage d'un message
    alert("Votre demande a été envoyée avec succès !");
  };

  return (
    <div className="order-confirmation-wrapper">
      {/* Retour bouton */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Annuler</span>
      </button>

      <section className="confirmation-content">
        <div className="success-header">
          <CheckCircle2 size={60} className="success-icon" />
          <h1>Récapitulatif de votre demande</h1>
          <p>Veuillez vérifier les informations ci-dessous avant d'envoyer votre demande.</p>
        </div>

        <div className="details-grid">
          {/* Bloc Carte Choisie */}
          <div className="info-block card-chosen">
            <h3>Carte Choisie</h3>
            <div className="mini-card-preview" style={{ background: card.bg }}>
              <span className="card-name-mini">{card.name}</span>
              <span className="card-type-mini">{card.type}</span>
            </div>
            <p className="price-mini">{card.price} / mois</p>
          </div>

          {/* Bloc Titulaire */}
          <div className="info-block titular">
            <h3><User size={18} /> Titulaire de la carte</h3>
            <p className="user-name">{user.firstName} {user.lastName}</p>
          </div>

          {/* Bloc Compte Lié */}
          <div className="info-block account">
            <h3><Landmark size={18} /> Compte Lié</h3>
            <p className="iban">{user.linkedAccount}</p>
          </div>

          {/* Bloc Date */}
          <div className="info-block date">
            <h3><CalendarDays size={18} /> Date de la demande</h3>
            <p className="date-text">{user.currentDate}</p>
          </div>
        </div>

        {/* Formulaire Optionnel */}
        <form className="order-form" onSubmit={handleSendRequest}>
          <div className="form-group">
            <label htmlFor="additionalInfo">Quelque chose à ajouter ? (Optionnel)</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows="4"
              placeholder="Précisez votre demande ici si nécessaire..."
            ></textarea>
          </div>

          <div className="submit-container">
            <button type="submit" className="send-request-btn">
              <span>Envoyer ma demande</span>
              <Send size={18} className="send-icon" />
            </button>
          </div>
        </form>
      </section>

      <style jsx>{`
        .order-confirmation-wrapper {
          background: #fff;
          padding: 30px;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer; margin-bottom: 40px;
        }

        .confirmation-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .success-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .success-icon {
          color: #10b981;
          margin-bottom: 20px;
        }

        .success-header h1 {
          color: #1e293b;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .success-header p {
          color: #64748b;
          font-size: 16px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 50px;
        }

        .info-block {
          background: #f8fafc;
          padding: 25px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }

        .info-block h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #005a64;
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .card-chosen {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .mini-card-preview {
          width: 200px;
          height: 120px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          margin-bottom: 10px;
        }

        .card-name-mini { font-weight: 700; font-size: 14px; }
        .card-type-mini { font-size: 10px; opacity: 0.8; letter-spacing: 1px; }
        .price-mini { color: #1e293b; font-weight: 700; font-size: 16px; margin: 0; }

        .user-name, .iban, .date-text {
          color: #1e293b;
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }

        /* Formulaire */
        .order-form {
          background: #fff;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .form-group {
          margin-bottom: 30px;
        }

        .form-group label {
          display: block;
          color: #475569;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .form-group textarea {
          width: 100%;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          resize: vertical;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #005a64;
          box-shadow: 0 0 0 3px rgba(0, 90, 100, 0.1);
        }

        .submit-container {
          text-align: center;
        }

        /* BOUTON EN MOUVEMENT */
        .send-request-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #005a64 0%, #003d44 100%);
          color: white;
          border: none;
          padding: 18px 50px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(0, 90, 100, 0.2);
          position: relative;
          overflow: hidden;
          
          /* Animation de base (flottement) */
          animation: btnFloat 3s ease-in-out infinite;
        }

        /* Effet de brillance en mouvement */
        .send-request-btn::after {
          content: '';
          position: absolute;
          top: -100%; left: -100%;
          width: 300%; height: 300%;
          background: linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 60%);
          animation: shineFlow 4s infinite;
        }

        .send-request-btn:hover {
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 15px 30px rgba(0, 90, 100, 0.3);
        }

        @keyframes btnFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes shineFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .success-header h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}