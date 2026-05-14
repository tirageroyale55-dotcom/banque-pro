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

  const status = card.status === "En cours d'investigation" ? "EN COURS" : (card.status || "inactive");
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status.toLowerCase()}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FRONT --- */}
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

          {/* PUCE RÉALISTE (STRICTEMENT RESTAURÉE) */}
          <div className="chip-area">
            {isCustomCard ? (
              <div className="emv-chip-custom">
                <div className="chip-line-h1"></div>
                <div className="chip-line-h2"></div>
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
              
              <div className={`card-status-badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="status-dot"></span>
                {status}
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* MASTERCARD CSS (ALIGNEMENT FIXE) */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- BACK (PROPRE - SANS DÉBORDEMENT) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Gloss et Structure */
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }

        /* Logo BPER */
        .bper-logo-custom { font-weight: 900; font-size: 19px; letter-spacing: -0.5px; z-index: 2; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; opacity: 0.8; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; z-index: 2; }

        /* PUCE EMV RÉALISTE */
        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 1px solid rgba(0,0,0,0.15);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.25); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.25); height: 100%; width: 1px; left: 50%; }

        /* Footer & Aligner */
        .footer-left-group { display: flex; flex-direction: column; gap: 6px; flex: 1; z-index: 2; }
        .exp-section { z-index: 2; margin-right: 15px; }
        .holder-section span, .exp-section span { display: block; font-size: 8px; color: rgba(255,255,255,0.7); margin-bottom: 2px; }
        .holder-section strong, .exp-section strong { font-size: 11px; color: white; text-transform: uppercase; }

        /* Statut Badge */
        .card-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 12px; font-size: 8px; font-weight: 800;
          background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: white;
        }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .en-cours .status-dot { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: pulse 2s infinite; }
        .active .status-dot { background: #4ade80; box-shadow: 0 0 6px #4ade80; }

        /* MASTERCARD CSS (FIXE) */
        .mastercard-css-wrapper { position: relative; width: 40px; height: 25px; display: flex; align-items: center; z-index: 2; }
        .mc-circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .card-number { font-size: 16px; }
          .holder-section strong, .exp-section strong { font-size: 9px; }
        }
      `}</style>
    </div>
  );
}