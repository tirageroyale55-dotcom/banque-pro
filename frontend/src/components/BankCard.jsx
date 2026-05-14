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
        
        {/* --- FACE AVANT (RECTO) --- */}
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
            <Wifi size={22} className="nfc-icon-custom" />
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

            {/* EXP : Ajouté et fixé pour la carte personnalisée */}
            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* Logo Mastercard : PRÉSENT UNIQUEMENT ICI */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) : SANS LOGO MASTERCARD --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* Le logo Mastercard est volontairement absent ici pour la sécurité */}
        </div>
      </div>

      <style jsx>{`
        /* STYLE IDENTIQUE MOBILE & DESKTOP */
        .footer-left-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 8px;
          font-weight: 800;
          color: white;
          width: fit-content;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }
        .en-cours .dot-light, .active .dot-light { animation: blink 2s infinite; box-shadow: 0 0 6px currentColor; }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative;
        }

        .mastercard-css-wrapper {
          position: relative; width: 45px; height: 28px;
          display: flex; align-items: center; margin-left: 10px;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.92; }

        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        
        .exp-section span { display: block; font-size: 8px; opacity: 0.8; margin-bottom: 2px; }
        .exp-section strong { font-size: 11px; color: white; }

        /* Synchronisation parfaite Mobile/Desktop */
        @media (max-width: 1000px) {
          .card-front, .card-back { padding: 20px; }
          .card-number { font-size: 1.1rem; letter-spacing: 2px; }
        }
      `}</style>
    </div>
  );
}