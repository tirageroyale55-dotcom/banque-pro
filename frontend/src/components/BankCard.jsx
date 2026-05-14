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
        {/* --- FACE AVANT (RECTO) : LOGO MASTERCARD PRÉSENT --- */}
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

            {/* LOGO MASTERCARD : UNIQUEMENT ICI SUR LE RECTO */}
            <div className="mastercard-fixed-layout">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) : AUCUN LOGO MASTERCARD --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* Le logo Mastercard a été supprimé d'ici pour toutes les versions */}
        </div>
      </div>

      <style jsx>{`
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
          width: fit-content;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }

        .en-cours .dot-light, .active .dot-light { 
          animation: blink-status 2s infinite; 
          box-shadow: 0 0 6px currentColor;
        }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        .blocked .dot-light { background: #f87171; color: #f87171; }
        .inactive .dot-light { background: #94a3b8; }

        @keyframes blink-status { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
          border: 0.5px solid rgba(0,0,0,0.2);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        /* TAILLE EXACTE MASTERCARD */
        .mastercard-fixed-layout {
          position: relative; width: 45px; height: 28px;
          display: flex; align-items: center; margin-left: 10px;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.92; }

        .nfc-icon-all { opacity: 0.8; transform: rotate(90deg); color: white; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }

        /* Ajoute ou modifie ces règles dans ton bloc <style jsx> */

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d; /* Indispensable pour le 3D */
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Pour Safari/iPhone */
  backface-visibility: hidden;         /* Cache la face quand elle est retournée */
  overflow: hidden;                     /* Empêche les débordements de logo */
}

.card-back {
  transform: rotateY(180deg); /* Le verso doit être retourné de base */
}

/* Force le logo à rester sur son plan */
.mastercard-fixed-layout {
  position: relative; 
  width: 45px; 
  height: 28px;
  display: flex; 
  align-items: center; 
  margin-left: 10px;
  transform: translateZ(1px); /* Force le logo à être "posé" sur le recto */
}
      `}</style>
    </div>
  );
}