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
      className={`card-container-fixed ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT --- */}
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
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-badge-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            <div className="mastercard-fixed-layout">
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
        /* FIX IPHONE : Perspective et Stabilité 3D */
        .card-container-fixed {
          width: 100%;
          max-width: 360px;
          height: 220px;
          perspective: 1000px;
          -webkit-perspective: 1000px;
          cursor: pointer;
          margin: 0 auto;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }

        .card-container-fixed.flipped .card-inner {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden; /* FIX IPHONE : empêche de voir l'envers */
          backface-visibility: hidden;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .card-back {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
          background: #1a1a1a;
          justify-content: flex-start;
          padding: 0;
        }

        /* ÉLÉMENTS GRAPHIQUES (Fixés pour être identiques partout) */
        .footer-left-group { display: flex; flex-direction: column; gap: 5px; }
        
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 8px;
          font-weight: 800;
          color: white;
          width: fit-content;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; box-shadow: 0 0 5px #fbbf24; animation: blink 2s infinite; }
        .active .dot-light { background: #4ade80; color: #4ade80; box-shadow: 0 0 5px #4ade80; animation: blink 2s infinite; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
        }

        .mastercard-fixed-layout {
          position: relative; width: 45px; height: 28px;
          display: flex; align-items: center;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.92; }

        .nfc-icon-all { opacity: 0.8; transform: rotate(90deg); color: white; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
      `}</style>
    </div>
  );
}