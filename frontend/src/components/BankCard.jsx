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
  // On s'assure que "En cours d'investigation" devient bien "EN COURS"
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

            {/* LOGO MASTERCARD CSS : Taille et forme exactes */}
            <div className="mastercard-fixed-layout">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) --- */}
        {/* Ici, on ne met ABSOLUMENT RIEN qui ressemble à un logo */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* NETTOYAGE COMPLET DU VERSO */}
        </div>
      </div>

      <style jsx>{`
        /* Style identique Mobile & Desktop */
        .footer-left-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 8px;
          font-weight: 800;
          color: white;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }
        .en-cours .dot-light { background: #fbbf24; animation: blink 2s infinite; }
        .active .dot-light { background: #4ade80; animation: blink 2s infinite; }
        
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
        }

        /* LOGO MASTERCARD CSS : Positionné uniquement dans le footer du recto */
        .mastercard-fixed-layout {
          position: relative; width: 45px; height: 28px;
          display: flex; align-items: center;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.92; }

        .nfc-icon-all { opacity: 0.8; transform: rotate(90deg); color: white; }
      `}</style>
    </div>
  );
}