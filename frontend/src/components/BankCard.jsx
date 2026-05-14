import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.toString().slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const status = card.status || "inactive";
  
  // Libellés des statuts
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "En cours d'investigation": "EN COURS D'INVESTIGATION"
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        <div className="card-front" style={isCustomCard ? { background: card.bg } : {}}>
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          <div className="card-header">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            <Wifi size={22} className="nfc-icon-custom" />
          </div>

          <div className="chip-area">
            {isCustomCard ? (
              <div className="emv-chip-custom">
                <div className="chip-line-h"></div>
                <div className="chip-line-v"></div>
              </div>
            ) : (
              <div className="chip"></div>
            )}
          </div>

          <div className="card-number">{formatNumber(card.number)}</div>

          <div className="card-footer">
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* --- BOUTON STATUT AVEC LED --- */}
              <div className={`status-pill ${status}`}>
                <span className="status-led"></span>
                <span className="status-label">{statusText[status] || status}</span>
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* --- STYLE DU BOUTON / PILLULE DE STATUT --- */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: fit-content;
          margin-top: 4px;
          backdrop-filter: blur(4px);
        }

        .status-label {
          font-size: 8px;
          font-weight: 800;
          color: white;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        /* --- LA LED (POINT ALLUMÉ) --- */
        .status-led {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8; /* Gris par défaut */
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
        }

        /* --- COULEURS DYNAMIQUES SELON LE STATUT --- */
        
        /* ACTIF : LED VERTE */
        .status-pill.active .status-led {
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }

        /* BLOQUÉ : LED ROUGE */
        .status-pill.blocked .status-led {
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }

        /* INACTIF / EN ATTENTE : LED ORANGE + PULSATION */
        .status-pill.inactive .status-led,
        .status-pill[class*="investigation"] .status-led {
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
          animation: pulse-led 1.5s infinite;
        }

        @keyframes pulse-led {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; box-shadow: 0 0 12px #f59e0b; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* --- RESTE DU STYLE (Inchangé) --- */
        .footer-left-group { display: flex; flex-direction: column; flex: 1; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }
        .emv-chip-custom { width: 38px; height: 28px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%); border-radius: 5px; position: relative; }
        .mastercard-css-wrapper { position: relative; width: 42px; height: 26px; display: flex; align-items: center; }
        .mc-circle { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }
      `}</style>
    </div>
  );
}