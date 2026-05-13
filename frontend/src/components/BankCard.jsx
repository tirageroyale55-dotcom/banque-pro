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
        {/* --- FACE AVANT --- */}
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
            {isCustomCard ? (
              <Wifi size={22} className="nfc-icon-custom" />
            ) : (
              <img src="/bancomat.svg" height="28" alt="bancomat" />
            )}
          </div>

          {/* LA PUCE */}
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

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            {/* BLOC GAUCHE : TITULAIRE + STATUT DESSOUS */}
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* STATUT POSITIONNÉ SOUS LE NOM */}
              <div className={`card-status-badge ${status}`}>
                {statusText[status] || status}
              </div>
            </div>

            {/* BLOC MILIEU : EXP */}
            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD CSS */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }

        /* Groupement Footer */
        .footer-left-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .holder-section span, .exp-section span {
          display: block;
          font-size: 8px;
          opacity: 0.8;
          margin-bottom: 2px;
        }

        /* STYLE DU STATUT TYPE "BANQUE PRO" */
        .card-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          letter-spacing: 0.5px;
        }

        /* Variantes de couleurs de statut discrètes */
        .card-status-badge.active { color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
        .card-status-badge.blocked { color: #f87171; }
        .card-status-badge.inactive { color: #fbbf24; }

        /* Logos et Puce */
        .bper-logo-custom { font-weight: 900; font-size: 19px; color: white; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.1); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.1); }

        /* Logo Mastercard Exact */
        .mastercard-css-wrapper {
          position: relative; width: 42px; height: 26px;
          display: flex; align-items: center; margin-left: 10px;
        }
        .mc-circle { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        @media (max-width: 768px) {
          .card-status-badge { font-size: 7px; padding: 2px 6px; }
        }
      `}</style>
    </div>
  );
}