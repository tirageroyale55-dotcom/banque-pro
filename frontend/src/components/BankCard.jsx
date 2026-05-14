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
  const isPending = rawStatus === "En cours d'investigation" || rawStatus === "EN COURS";
  const displayStatus = isPending ? "EN COURS" : rawStatus;

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
        {/* --- FRONT --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg } : {}}
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
            <Wifi size={22} className="nfc-icon-all" />
          </div>

          <div className="chip-area">
            <div className="emv-chip-real">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            {/* FOOTER GAUCHE : NOM + STATUT */}
            <div className="footer-main-info">
              <div className="holder-block">
                <span className="label-tiny">TITULAIRE</span>
                <strong className="value-name">{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-badge-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            {/* EXPIRATION */}
            <div className="exp-block">
              <span className="label-tiny">EXP</span>
              <strong className="value-exp">{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD RECTO SEUL */}
            <div className="mastercard-fixed">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- BACK (CVV) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* FORCER LE MÊME RENDU MOBILE ET DESKTOP */
        .card-front {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px !important;
          box-sizing: border-box;
        }

        .card-footer {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-end !important;
          justify-content: space-between !important;
          width: 100%;
          margin-top: auto;
        }

        .footer-main-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label-tiny { display: block; font-size: 8px; opacity: 0.7; margin-bottom: 2px; }
        .value-name, .value-exp { font-size: 11px; white-space: nowrap; }

        /* STATUT LUMINEUX */
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 8px;
          font-weight: 800;
          color: white;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }
        .active .dot-light { background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: blink 2s infinite; }
        .en-cours .dot-light { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: blink 2s infinite; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* PUCE EMV */
        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
        }

        /* MASTERCARD LOGO (Recto seulement) */
        .mastercard-fixed {
          position: relative;
          width: 45px;
          height: 28px;
          flex-shrink: 0;
        }
        .mc-circle { width: 26px; height: 26px; border-radius: 50%; position: absolute; top: 0; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        .nfc-icon-all { transform: rotate(90deg); opacity: 0.8; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
      `}</style>
    </div>
  );
}