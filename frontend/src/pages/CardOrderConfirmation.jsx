import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, User, Landmark, CalendarDays, Send, Wifi } from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  // États pour les données de la base de données
  const [userData, setUserData] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulation de récupération de données (à remplacer par tes appels API vers /api/user et /api/account)
    const fetchDbData = async () => {
      try {
        // Ici tu feras tes : const res = await axios.get('/api/me')
        // En attendant, j'utilise les structures exactes de tes fichiers User.js et Account.js
        setUserData({
          prenom: "Jean", // issu de UserSchema.prenom
          nom: "Dupont",   // issu de UserSchema.nom
          email: "jean.dupont@email.com"
        });
        
        setAccountData({
          iban: "IT76 L 05387 12345 000000123456", // issu de AccountSchema.iban
          bic: "BPERITM1XXX", // issu de AccountSchema.bic
          accountNumber: "000000123456" // issu de AccountSchema.accountNumber
        });
      } catch (err) {
        console.error("Erreur chargement données", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDbData();
  }, []);

  if (!card) return <div className="p-10">Chargement de la session...</div>;
  if (loading) return <div className="p-10 text-center">Initialisation du protocole sécurisé...</div>;

  return (
    <div className="order-confirmation-container">
      {/* Bouton Retour identique à Details */}
      <button className="back-action-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Modifier mon choix</span>
      </button>

      <div className="confirmation-grid">
        
        {/* COLONNE GAUCHE : RÉCAPITULATIF CARTE (STYLE EXACT CARDDETAILS) */}
        <div className="summary-section">
          <div className="header-badge">
            <CheckCircle2 size={20} />
            <span>Vérification de votre commande</span>
          </div>
          <h1>Récapitulatif</h1>
          <p className="subtitle">Vérifiez les détails de votre future carte BPER.</p>

          <div className="card-preview-zone">
            <div className="card-perspective-wrapper">
              <div className="card-floating-animation">
                {/* REPRODUCTION STRICTE DU STYLE CARDDETAILS.JSX */}
                <div className="card-physical-container">
                  <div className="card-body" style={{ background: card.bg }}>
                    <div className="card-gloss"></div>
                    
                    <div className="card-top-row">
                      <div className="bper-logo" style={{ color: card.logoColor }}>
                        BPER<span>:</span> <small>Banca</small>
                      </div>
                      <Wifi size={20} className="nfc-icon" strokeWidth={1.5} />
                    </div>

                    <div className="emv-chip">
                      <div className="chip-line horizontal-1"></div>
                      <div className="chip-line horizontal-2"></div>
                      <div className="chip-line vertical"></div>
                    </div>

                    <div className="card-bottom-row">
                      <div className="card-label">{card.type}</div>
                      <div className="mc-symbol">
                        <div className="circle red"></div>
                        <div className="circle yellow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-meta">
              <h2>{card.name}</h2>
              <p className="price">{card.price} <span>/ mois</span></p>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : INFOS BASE DE DONNÉES (USER.JS & ACCOUNT.JS) */}
        <div className="data-section">
          <div className="info-card">
            <h3><User size={18} /> Titulaire du contrat</h3>
            <div className="db-value">
              <span className="label">Nom complet</span>
              <span className="value">{userData.prenom} {userData.nom}</span>
            </div>
            <div className="db-value">
              <span className="label">Identifiant Client</span>
              <span className="value">{userData.email}</span>
            </div>
          </div>

          <div className="info-card">
            <h3><Landmark size={18} /> Compte de prélèvement</h3>
            <div className="db-value">
              <span className="label">Numéro de compte</span>
              <span className="value">{accountData.accountNumber}</span>
            </div>
            <div className="db-value">
              <span className="label">IBAN</span>
              <span className="value mono">{accountData.iban}</span>
            </div>
            <div className="db-value">
              <span className="label">BIC / SWIFT</span>
              <span className="value">{accountData.bic}</span>
            </div>
          </div>

          <div className="info-card">
            <h3><CalendarDays size={18} /> Livraison estimée</h3>
            <p className="info-text">Sous 3 à 5 jours ouvrés après validation de la demande à votre adresse de résidence.</p>
          </div>

          {/* Formulaire & Bouton d'envoi */}
          <div className="action-zone">
            <label>Commentaire (Optionnel)</label>
            <textarea placeholder="Ex: Livraison en agence souhaitée..."></textarea>
            
            <button className="confirm-order-btn">
              <span>Confirmer la commande</span>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-confirmation-container {
          background: #fff;
          padding: 20px 40px;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          max-width: 1400px;
          margin: 0 auto;
        }

        .back-action-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer; margin-bottom: 30px;
        }

        .confirmation-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
        }

        /* --- STYLE CARTE (COPIE EXACTE) --- */
        .summary-section h1 { color: #1e293b; font-size: 32px; font-weight: 800; margin: 10px 0; }
        .subtitle { color: #64748b; margin-bottom: 40px; }

        .card-preview-zone {
          background: #f8fafc;
          padding: 50px;
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #f1f5f9;
        }

        .card-perspective-wrapper { perspective: 1000px; }
        .card-floating-animation { animation: cardFloat 5s ease-in-out infinite; transform-style: preserve-3d; }
        
        .card-physical-container {
          padding: 20px; background: white; border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .card-body {
          width: 320px; aspect-ratio: 1.58 / 1; border-radius: 14px;
          position: relative; padding: 22px; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo { font-weight: 900; font-size: 22px; }
        .bper-logo span { color: #a3e635; }
        .nfc-icon { color: white; transform: rotate(90deg); }

        .emv-chip {
          width: 45px; height: 35px; border-radius: 6px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          position: relative; border: 1px solid rgba(0,0,0,0.1);
        }

        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-label { color: white; font-weight: 800; font-size: 12px; letter-spacing: 1px; }

        .mc-symbol { display: flex; position: relative; width: 40px; height: 25px; }
        .circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        .card-meta { text-align: center; margin-top: 30px; }
        .card-meta h2 { color: #1e293b; font-size: 22px; }
        .card-meta .price { color: #005a64; font-weight: 800; font-size: 24px; }
        .card-meta .price span { font-size: 14px; color: #94a3b8; }

        /* --- STYLE INFOS DB --- */
        .info-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 25px; margin-bottom: 20px;
        }

        .info-card h3 {
          display: flex; align-items: center; gap: 10px;
          color: #005a64; font-size: 16px; font-weight: 800;
          margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;
        }

        .db-value { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .db-value .label { color: #64748b; font-size: 13px; }
        .db-value .value { color: #1e293b; font-weight: 700; font-size: 15px; }
        .db-value .value.mono { font-family: 'Roboto Mono', monospace; font-size: 13px; }

        .action-zone label { display: block; margin-bottom: 10px; font-weight: 700; color: #1e293b; }
        .action-zone textarea {
          width: 100%; border-radius: 12px; border: 1px solid #e2e8f0;
          padding: 15px; font-family: inherit; margin-bottom: 25px;
        }

        .confirm-order-btn {
          width: 100%; background: #005a64; color: white; border: none;
          padding: 20px; border-radius: 15px; font-weight: 800; font-size: 17px;
          cursor: pointer; display: flex; justify-content: center; align-items: center;
          gap: 15px; transition: 0.3s;
          box-shadow: 0 10px 25px rgba(0, 90, 100, 0.2);
        }

        .confirm-order-btn:hover { background: #00454d; transform: translateY(-3px); }

        @keyframes cardFloat {
          0%, 100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-10px); }
        }

        @media (max-width: 1024px) {
          .confirmation-grid { grid-template-columns: 1fr; }
          .order-confirmation-container { padding: 20px; }
        }
      `}</style>
    </div>
  );
}