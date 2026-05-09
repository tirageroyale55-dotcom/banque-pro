import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Landmark, User, FileText, Send, Wifi, ChevronRight } from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  // États basés sur tes schémas Mongoose
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulation d'appel API vers tes modèles MongoDB
    const fetchData = async () => {
      // Ici : fetch('/api/user/me') et fetch('/api/account/me')
      setTimeout(() => {
        setUser({
          civilite: "M.",
          nom: "ROSSI",
          prenom: "Alessandro",
          situationProfessionnelle: "Salarié",
          email: "a.rossi@bper.it",
          adresse: "Via San Carlo, 8",
          ville: "Modena"
        });
        setAccount({
          accountNumber: "1000/542897",
          iban: "IT 76 L 05387 12345 000000542897",
          bic: "BPERITM1XXX"
        });
        setLoading(false);
      }, 800);
    };
    fetchData();
  }, []);

  if (!card || loading) return <div className="loading-screen">Authentification sécurisée...</div>;

  return (
    <div className="order-conf-wrapper">
      {/* HEADER NAVIGATION */}
      <header className="order-header">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>RETOUR AUX DÉTAILS</span>
        </button>
        <div className="stepper">
          <div className="step active">Configuration</div>
          <ChevronRight size={14} />
          <div className="step current">Confirmation</div>
          <ChevronRight size={14} />
          <div className="step">Activation</div>
        </div>
      </header>

      <main className="order-main-grid">
        
        {/* COLONNE GAUCHE : VISUEL CARTE & RÉCAPITULATIF */}
        <div className="visual-column">
          <div className="sticky-content">
            <div className="bper-card-showcase">
              <div className="card-perspective">
                {/* STYLE EXACT DE CARDDETAILS.JSX */}
                <div className="card-body" style={{ background: card.bg }}>
                  <div className="card-gloss"></div>
                  <div className="card-top-row">
                    <div className="bper-logo" style={{ color: card.logoColor }}>
                      BPER<span>:</span> <small>Banca</small>
                    </div>
                    <Wifi size={20} className="nfc-icon" />
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

            <div className="selection-summary">
              <h2>{card.name}</h2>
              <div className="price-row">
                <span className="amount">{card.price}</span>
                <span className="period">/ mois</span>
              </div>
              <ul className="mini-features">
                <li><ShieldCheck size={14} /> Assurance incluse</li>
                <li><Wifi size={14} /> Paiement sans contact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : DONNÉES USER ET ACCOUNT (BASE DE DONNÉES) */}
        <div className="forms-column">
          <div className="section-title">
            <h1>Confirmation de commande</h1>
            <p>Veuillez valider vos informations de porteur de carte.</p>
          </div>

          {/* BLOC USER.JS */}
          <div className="data-panel">
            <div className="panel-header">
              <User size={18} />
              <h3>Identité du titulaire</h3>
            </div>
            <div className="grid-info">
              <div className="info-item">
                <label>Nom complet</label>
                <p>{user.civilite} {user.prenom} {user.nom}</p>
              </div>
              <div className="info-item">
                <label>Situation</label>
                <p>{user.situationProfessionnelle}</p>
              </div>
              <div className="info-item full">
                <label>Adresse de livraison</label>
                <p>{user.adresse}, {user.ville}</p>
              </div>
            </div>
          </div>

          {/* BLOC ACCOUNT.JS */}
          <div className="data-panel">
            <div className="panel-header">
              <Landmark size={18} />
              <h3>Compte associé</h3>
            </div>
            <div className="grid-info">
              <div className="info-item">
                <label>Compte N°</label>
                <p>{account.accountNumber}</p>
              </div>
              <div className="info-item">
                <label>Code SWIFT/BIC</label>
                <p>{account.bic}</p>
              </div>
              <div className="info-item full">
                <label>IBAN de prélèvement</label>
                <p className="mono">{account.iban}</p>
              </div>
            </div>
          </div>

          <div className="legal-notice">
            <FileText size={16} />
            <p>En confirmant, vous acceptez les conditions tarifaires de la <strong>{card.name}</strong> liées au compte {account.accountNumber}.</p>
          </div>

          <button className="bper-btn-primary">
            <span>CONFIRMER LA DEMANDE</span>
            <Send size={18} />
          </button>
        </div>
      </main>

      <style jsx>{`
        .order-conf-wrapper {
          background: #f4f7f9;
          min-height: 100vh;
          padding: 0 0 50px 0;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* --- HEADER & NAVIGATION --- */
        .order-header {
          background: white;
          padding: 15px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-link {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #64748b;
          font-weight: 600; font-size: 12px; cursor: pointer;
        }

        .stepper { display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 13px; }
        .step.current { color: #005a64; font-weight: 700; }

        /* --- LAYOUT GRID --- */
        .order-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1200px;
          margin: 40px auto;
          gap: 30px;
          padding: 0 20px;
        }

        @media (min-width: 1024px) {
          .order-main-grid { grid-template-columns: 400px 1fr; gap: 60px; }
        }

        /* --- VISUAL COLUMN (CARTE) --- */
        .sticky-content { position: sticky; top: 100px; }
        
        .bper-card-showcase {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          display: flex; justify-content: center;
        }

        /* COPIE EXACTE DU STYLE CARTE DEMANDÉ */
        .card-body {
          width: 280px; aspect-ratio: 1.58/1; border-radius: 14px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo { font-weight: 900; font-size: 18px; }
        .bper-logo span { color: #a3e635; }
        .emv-chip { 
          width: 40px; height: 30px; border-radius: 5px;
          background: linear-gradient(135deg, #facc15, #ca8a04);
        }
        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-label { color: white; font-size: 10px; font-weight: 800; letter-spacing: 1px; }
        .mc-symbol { display: flex; position: relative; width: 35px; height: 22px; }
        .circle { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.8; }

        .selection-summary { margin-top: 25px; text-align: center; }
        .selection-summary h2 { color: #1e293b; font-size: 20px; margin-bottom: 5px; }
        .price-row .amount { font-size: 28px; font-weight: 800; color: #005a64; }
        .price-row .period { color: #64748b; font-size: 14px; margin-left: 5px; }

        /* --- FORMS COLUMN (DATA DB) --- */
        .section-title { margin-bottom: 30px; }
        .section-title h1 { color: #1e293b; font-size: 28px; font-weight: 800; }
        .section-title p { color: #64748b; }

        .data-panel {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }

        .panel-header {
          display: flex; align-items: center; gap: 10px;
          color: #005a64; margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;
        }

        .panel-header h3 { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item label { display: block; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
        .info-item p { color: #1e293b; font-weight: 600; font-size: 15px; margin: 0; }
        .info-item.full { grid-column: span 2; }
        .info-item p.mono { font-family: 'Roboto Mono', monospace; font-size: 14px; }

        .legal-notice {
          display: flex; gap: 12px; background: #eef2f6;
          padding: 15px; border-radius: 12px; margin: 30px 0;
          color: #475569; font-size: 13px; line-height: 1.5;
        }

        /* --- BUTTONS --- */
        .bper-btn-primary {
          width: 100%;
          background: #005a64;
          color: white;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(0, 90, 100, 0.15);
        }

        .bper-btn-primary:hover {
          background: #00454d;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0, 90, 100, 0.25);
        }

        .loading-screen {
          height: 100vh; display: flex; align-items: center; justify-content: center;
          color: #005a64; font-weight: 700; background: #f4f7f9;
        }

        @media (max-width: 768px) {
          .grid-info { grid-template-columns: 1fr; }
          .info-item.full { grid-column: span 1; }
          .order-main-grid { margin: 20px auto; }
        }
      `}</style>
    </div>
  );
}