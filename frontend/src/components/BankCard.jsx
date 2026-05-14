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

  // Simplification du statut
  const status = card.status === "En cours d'investigation" ? "EN COURS" : (card.status || "inactive");
  
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "EN COURS": "EN COURS"
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
              
              {/* STATUS AVEC POINT LUMINEUX */}
              <div className={`card-status-badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="status-dot"></span>
                {statusText[status] || status}
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
        .footer-left-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }

        /* STYLE DU BADGE LUMINEUX */
        .card-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px; /* Forme pilule plus moderne */
          font-size: 9px;
          font-weight: 800;
          width: fit-content;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          letter-spacing: 0.3px;
        }

        /* LE POINT LUMINEUX (DOT) */
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8; /* Gris par défaut */
        }

        /* COULEURS SELON LE STATUT */
        .active .status-dot { 
          background: #4ade80; 
          box-shadow: 0 0 8px #4ade80;
          animation: pulse 2s infinite; 
        }
        .en-cours .status-dot { 
          background: #fbbf24; 
          box-shadow: 0 0 8px #fbbf24;
          animation: pulse 2s infinite;
        }
        .blocked .status-dot { background: #f87171; box-shadow: 0 0 8px #f87171; }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* RESPONSIVE MOBILE */
        @media (max-width: 768px) {
          .card-status-badge { font-size: 8px; padding: 3px 8px; }
          .footer-left-group { gap: 4px; }
        }

        /* --- STYLES REPRIS POUR LA COHÉRENCE --- */
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }
        .mastercard-css-wrapper { position: relative; width: 42px; height: 26px; display: flex; align-items: center; }
        .mc-circle { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }
      `}</style>
    </div>
  );
}