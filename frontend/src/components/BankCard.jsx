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
  const isPending = rawStatus === "En cours d'investigation" || rawStatus === "EN COURS" || rawStatus === "pending";
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
      className={`bank-card-container ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner-3d">
        {/* --- FRONT --- */}
        <div 
          className="card-face-front" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="gloss-overlay"></div>}

          {/* HEADER : Logo + Wifi */}
          <div className="card-top-header">
            {isCustomCard ? (
              <div className="bper-brand-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank-label">BPER</div>
            )}
            <Wifi size={24} className="nfc-icon-fixed" />
          </div>

          {/* PUCE EMV RÉALISTE */}
          <div className="chip-container">
            <div className="real-emv-chip">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          {/* NUMÉRO DE CARTE */}
          <div className="card-number-display">
            {formatNumber(card.number)}
          </div>

          {/* FOOTER : NOM + STATUT + EXP + MASTERCARD */}
          <div className="card-bottom-footer">
            <div className="footer-left-info">
              <div className="holder-block">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-pill ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="light-indicator"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="expiration-block">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD CSS EXACT */}
            <div className="mastercard-logo-css">
              <div className="mc-circle-red"></div>
              <div className="mc-circle-orange"></div>
            </div>
          </div>
        </div>

        {/* --- BACK (CVV) --- */}
        <div className="card-face-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic-stripe"></div>
          <div className="cvv-signature-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* STRUCTURE DE BASE IDENTIQUE MOBILE/DESKTOP */
        .bank-card-container {
          width: 100%;
          max-width: 350px;
          aspect-ratio: 1.58 / 1;
          perspective: 1000px;
          cursor: pointer;
          margin: 0 auto;
        }

        .card-inner-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flipped .card-inner-3d { transform: rotateY(180deg); }

        .card-face-front, .card-face-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #005a64; /* Couleur par défaut */
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .card-face-back { transform: rotateY(180deg); background: #004a52; }

        /* HEADER */
        .card-top-header { display: flex; justify-content: space-between; align-items: center; }
        .bper-brand-custom { font-weight: 900; font-size: 20px; color: white; }
        .bper-brand-custom span { color: #a3e635; }
        .card-bank-label { color: white; font-weight: bold; font-size: 18px; }
        .nfc-icon-fixed { color: white; transform: rotate(90deg); opacity: 0.9; }

        /* CHIP */
        .real-emv-chip {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative;
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        /* NUMBER */
        .card-number-display {
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 1.3rem;
          letter-spacing: 2px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          margin: 10px 0;
        }

        /* FOOTER */
        .card-bottom-footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .footer-left-info { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .holder-block span, .expiration-block span { font-size: 8px; color: rgba(255,255,255,0.8); display: block; }
        .holder-block strong, .expiration-block strong { color: white; font-size: 12px; }

        /* STATUT LUMINEUX */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(0,0,0,0.4);
          border-radius: 20px;
          color: white;
          font-size: 9px;
          font-weight: bold;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .light-indicator { width: 6px; height: 6px; border-radius: 50%; }
        .active .light-indicator { background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: blink 2s infinite; }
        .en-cours .light-indicator { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: blink 2s infinite; }
        .blocked .light-indicator { background: #f87171; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* MASTERCARD EXACT CSS */
        .mastercard-logo-css {
          position: relative; width: 45px; height: 28px; display: flex; align-items: center;
        }
        .mc-circle-red, .mc-circle-orange { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-circle-red { background: #eb001b; left: 0; }
        .mc-circle-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* BACK FACE SPECIFICS */
        .magnetic-stripe { width: 110%; height: 40px; background: #111; margin: 10px -20px; }
        .cvv-signature-box { background: white; height: 35px; width: 80%; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: black; border-radius: 4px; }

        .gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }

        /* MOBILE ADJUSTMENTS (Garde la proportion mais réduit légèrement les textes si besoin) */
        @media (max-width: 480px) {
          .card-number-display { font-size: 1.1rem; }
          .card-face-front { padding: 15px; }
          .status-pill { font-size: 8px; }
        }
      `}</style>
    </div>
  );
}