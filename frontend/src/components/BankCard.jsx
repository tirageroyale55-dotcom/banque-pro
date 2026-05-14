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

  const rawStatus = card.status || "inactive";
  const displayStatus = (rawStatus === "En cours d'investigation" || rawStatus === "EN COURS") ? "EN COURS" : rawStatus;

  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "EN COURS": "EN COURS"
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          {/* HEADER FIXE */}
          <div className="card-header-fixed">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank-default">BPER</div>
            )}
            <Wifi size={20} className="wifi-icon-fixed" />
          </div>

          {/* PUCE EMV (Taille bloquée pour éviter le désordre) */}
          <div className="chip-container-fixed">
            <div className="emv-chip-real">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number-fixed">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer-fixed">
            {/* BLOC TITULAIRE + STATUT */}
            <div className="footer-left-side">
              <div className="holder-box">
                <span className="label-mini">TITULAIRE</span>
                <strong className="value-text">{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-pill-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            {/* EXPIRATION */}
            <div className="exp-box">
              <span className="label-mini">EXP</span>
              <strong className="value-text">{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* MASTERCARD (Dimensions strictes) */}
            <div className="mastercard-fixed-box">
              <div className="mc-c mc-r"></div>
              <div className="mc-c mc-o"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (SANS LOGOS) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic-strip"></div>
          <div className="cvv-section">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* RESET LOCAL POUR ÉVITER LE DÉSORDRE MOBILE */
        .card-front, .card-front * { box-sizing: border-box; }
        
        .card-front {
          padding: 18px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }

        .card-header-fixed { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .card-bank-default { font-weight: bold; font-size: 18px; color: white; }
        .wifi-icon-fixed { transform: rotate(90deg); color: white; opacity: 0.9; }

        .chip-container-fixed { margin-top: 5px; }
        .emv-chip-real {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 4px; position: relative; border: 0.5px solid rgba(0,0,0,0.2);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        .card-number-fixed {
          font-size: 17px;
          letter-spacing: 1.5px;
          color: white;
          font-family: 'Courier New', monospace;
          margin: 10px 0;
        }

        .card-footer-fixed {
          display: flex !important;
          align-items: flex-end !important;
          justify-content: space-between !important;
          width: 100% !important;
        }

        .footer-left-side { display: flex; flex-direction: column; gap: 6px; }
        .label-mini { display: block; font-size: 7px; opacity: 0.7; margin-bottom: 2px; color: white; }
        .value-text { font-size: 10px; color: white; text-transform: uppercase; }

        /* STATUT PILULE */
        .status-pill-bper {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 8px; background: rgba(0,0,0,0.3);
          border-radius: 12px; font-size: 8px; font-weight: bold; color: white;
          border: 0.5px solid rgba(255,255,255,0.1);
        }
        .dot-light { width: 5px; height: 5px; border-radius: 50%; }
        .en-cours .dot-light, .active .dot-light { animation: blink 2s infinite; box-shadow: 0 0 5px currentColor; }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        .blocked .dot-light { background: #f87171; color: #f87171; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* MASTERCARD LOGO */
        .mastercard-fixed-box { position: relative; width: 42px; height: 26px; min-width: 42px; }
        .mc-c { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .mc-r { background: #eb001b; left: 0; z-index: 1; }
        .mc-o { background: #ff5f00; right: 0; z-index: 2; opacity: 0.9; }

        /* FIX POUR MOBILE */
        @media (max-width: 768px) {
          .card-number-fixed { font-size: 15px; }
          .value-text { font-size: 9px; }
          .card-front { padding: 15px !important; }
        }
      `}</style>
    </div>
  );
}