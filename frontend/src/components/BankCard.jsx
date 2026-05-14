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
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        
        {/* --- FACE AVANT (FRONT) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg, color: 'white' } : {}}
        >
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
              
              <div className={`card-status-badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="status-dot"></span>
                {status.toUpperCase()}
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

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-area-container">
            <div className="cvv-white-bar">
               {/* Le CVV est ici et nulle part ailleurs */}
               <span className="cvv-label">CVV</span>
               <strong className="cvv-value">{card.cvv || "•••"}</strong>
            </div>
            <div className="back-logo-placeholder">BPER:</div>
          </div>
        </div>

      </div>

      <style jsx>{`
        /* STRUCTURE DE BASE */
        .card-front, .card-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 15px;
          padding: 20px; display: flex; flex-direction: column;
          justify-content: space-between; overflow: hidden;
        }

        /* FIX DOS DE LA CARTE (CVV) */
        .card-back { transform: rotateY(180deg); }
        .magnetic { 
          background: #222; height: 40px; width: 115%; 
          margin-left: -25px; margin-top: 10px; 
        }
        .cvv-area-container { margin-top: 20px; }
        .cvv-white-bar {
          background: #eee; height: 35px; width: 80%;
          display: flex; align-items: center; justify-content: flex-end;
          padding-right: 15px; border-radius: 4px;
        }
        .cvv-label { color: #888; font-size: 8px; margin-right: 8px; font-weight: bold; }
        .cvv-value { color: #333; font-style: italic; font-family: 'Courier New', monospace; }

        /* FIX FRONT FOOTER */
        .card-footer { 
          display: flex; justify-content: space-between; 
          align-items: flex-end; z-index: 2; height: 50px;
        }
        .footer-left-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .exp-section { margin-right: 15px; text-align: left; }

        /* LOGO BPER & PUCES */
        .bper-logo-custom { font-weight: 900; font-size: 19px; line-height: 1; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; opacity: 0.8; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip-custom {
          width: 38px; height: 28px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
        }

        /* BADGE STATUT LUMINEUX */
        .card-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 12px; font-size: 8px;
          background: rgba(0, 0, 0, 0.4); color: white; width: fit-content;
        }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 5px #4ade80; }
        .en-cours .status-dot { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }

        /* MASTERCARD EXACT */
        .mastercard-css-wrapper { position: relative; width: 40px; height: 25px; min-width: 40px; }
        .mc-circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        @media (max-width: 768px) {
          .card-number { font-size: 16px; }
          .mastercard-css-wrapper { width: 35px; height: 22px; }
          .mc-circle { width: 22px; height: 22px; }
        }
      `}</style>
    </div>
  );
}